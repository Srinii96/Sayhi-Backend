const Booking = require("../models/booking-model")
const Order =  require("../models/order-status-model")
const { validationResult } = require("express-validator")
const _ = require("lodash")
const twilio = require("twilio")
const { getIOInstance } = require("../../config/socketConfig")


const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)

const bookingCltrs = {}

// list latest booking using a serviceProviderId
bookingCltrs.list = async (req, res)=>{
    try {
        const bookings = await Booking.find(
            {"serviceProviderId": req.user.serviceProviderId, "bookingStatus": "Pending"}
            )
            .populate({
                path: "userId",
                select: "profilePicture.url"
            })
            .populate({
                path: "categoryId",
                select: "title"
            })
            .populate({
                path: "serviceId",
                select: "serviceName"
            })
            .populate({
                path: "serviceProviderId",
                select: "serviceProviderName"
            })
            .populate({
                path: "addressId"
            })
        res.status(200).json(bookings)
    }catch(err){
        res.status(500).json(err)
    }
}

// list latest booking using a serviceProviderId
bookingCltrs.listAccepted = async (req, res)=>{
    try {
        const bookings = await Booking.find(
            {"serviceProviderId": req.user.serviceProviderId, 
                "bookingStatus": "Accepted", "payment": false}
            )
            .populate({
                path: "userId",
                select: "profilePicture.url"
            })
            .populate({
                path: "categoryId",
                select: "title"
            })
            .populate({
                path: "serviceId",
                select: "serviceName"
            })
            .populate({
                path: "serviceProviderId",
                select: "serviceProviderName"
            })
            .populate({
                path: "addressId"
            })
        res.status(200).json(bookings)
    }catch(err){
        res.status(500).json(err)
    }
}

// create
bookingCltrs.create = async (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({"error": errors.array()})
    }
    const { id } = req.user
    const body = _.pick(req.body, ["customerName", "email", "mobileNumber", "categoryId", "serviceId", "serviceProviderId", "addressId", "scheduleDate", "scheduleTime", "addDetails"])
    body.userId = id

    try {
        const existingBooking = await Booking.findOne({
            userId: id,
            serviceProviderId: body.serviceProviderId,
            scheduleDate: body.scheduleDate
          })
      
        if (existingBooking) {
            return res.status(400).json({ "error": "You have already booked this service provider today." });
        }

        const booking = await Booking.create(body)
        const bookingId = {"bookingId": booking._id}
        if(booking){
            const order = new Order(bookingId)
            order.userId = id
            if(order){
                await order.save()
                res.status(201).json({"bookingId": booking._id, "orderId": order._id})
            }else{
                res.status(400).json({"error": "Failed to create an order"})
            }
        }else{
            res.status(400).json({"error": "Booking service is unsuccessfull, try again."})
        }
    }catch(err){
        res.status(500).json(err)
    }
}

// showBookedSlots
bookingCltrs.showBookedSlots = async (req, res)=>{
    const {id} = req.params
    try{
        const bookings = await Booking.find({"serviceProviderId": id})
        res.status(200).json(bookings)
    }catch(err){
        res.status(500).json(err)
    }
}

// update booking status
bookingCltrs.updateStatus = async (req, res)=>{
    const { id, response } = req.params
    const { otp } = req.body

    const io = await getIOInstance()

    try {
        if(response === "start"){
            const booking = await Booking.findOneAndUpdate(
                {"_id": id, "serviceProviderId": req.user.serviceProviderId},
                {"isStarted": true},{new: true}
                )
                .populate({path: "serviceProviderId serviceId", 
                    select: "serviceProviderName serviceName"}
                )
                .populate({path: "userId", 
                select: "mobileNumber"})

            const phoneNumber = booking.userId.mobileNumber
                
            //Sending the notification via Twilio SMS

            // const message = await client.messages.create({
            //     body: `${booking.serviceProviderId.serviceProviderName} has started ${booking.serviceId.serviceName} service.`,
            //     from: 'whatsapp:+14155238886',
            //     to: `whatsapp:+91${phoneNumber}`
            // })

            res.status(200).json({"id": booking._id, "isStarted": booking.isStarted})
        }else if(response === "otp"){
            const OTP_EXPIRATION_DURATION = 5 * 60 * 1000
            const OTP = Math.floor(100000 + Math.random() * 900000)
            const booking = await Booking.findById(
                {"_id": id, "serviceProviderId": req.user.serviceProviderId}
                )
                .populate({path: "userId", 
                select: "mobileNumber"})

            const isTrue = booking.isStarted

            if(!isTrue){
                return res.status(400).json({"error": "please do service before ending...."})  
            }

            const phoneNumber = booking.userId.mobileNumber

            // Set expiration time for the OTP
            const otpExpirationTime = new Date(Date.now() + OTP_EXPIRATION_DURATION)

            // const message = await client.messages.create({
            //     body: `Your OTP for verification: ${OTP}`,
            //     from: 'whatsapp:+14155238886',
            //     to: `whatsapp:+91${phoneNumber}`
            // })

            await Booking.findOneAndUpdate(
                {"_id": id, "serviceProviderId": req.user.serviceProviderId},
                {
                    $set: {
                        "otp.value": OTP,
                        "otp.expiryTime": otpExpirationTime
                    }
                },{new: true}
            )

            res.status(200).json({"msg": 'OTP sent successfully to registered mobile number!'})
        }else{
            const booking = await Booking.findById(
                {"_id": id, "serviceProviderId": req.user.serviceProviderId}
            )

            const isOtp = booking.otp

            if(isOtp.value.length === 0){
                return res.status(400).json({"error": "please send OTP to user before ending service!"})  
            }

            // Check if OTP has expired
            const currentTime = Date.now()

            if (currentTime > new Date(isOtp.expiryTime).getTime()) {
                return res.status(400).json({ "error": "OTP has expired. Please send a new OTP." })
            }

            if(isOtp.value !== otp){
                return res.status(400).json({"error": "Incorrect OTP"})    
            }

            const result = await Booking.findOneAndUpdate(
                {"_id": id, "serviceProviderId": req.user.serviceProviderId},
                {"isEnded": true}, {new: true}
            )

            const statusResponse = _.pick(result, ["_id", "isEnded"])
            io.to(`${result.userId}`).emit("updateOrderStatusEnd", statusResponse)

            res.status(200).json({"id": booking._id, "isEnded": result.isEnded})
        }  
    } catch(err){
        res.status(500).json(err)
    }
}

module.exports = bookingCltrs