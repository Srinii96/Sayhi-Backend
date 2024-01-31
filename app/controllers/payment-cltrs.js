const Payment = require("../models/payment-model")
const Order = require("../models/order-status-model")
const Booking = require("../models/booking-model")
const { validationResult } = require("express-validator")
const _ = require("lodash")
const { getIOInstance } = require("../../config/socketConfig")
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const paymentCltrs = {}

// create
paymentCltrs.create = async (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({"error": errors.array()})
    }

    const body = _.pick(req.body, ["amount", "bookingId", "orderId"])

    const lineItems = [{
        price_data : {
            currency: "inr",
            product_data : {
                name: "Service charges"
            },
            unit_amount: body.amount * 100
        },
        quantity: 1
    }]

    const customer = await stripe.customers.create({
        name: "Testing",
        address: {
            line1: 'India',
            postal_code: '517501',
            city: 'Tirupati',
            state: 'AP',
            country: 'US',
        },
    })

    try{
        const session = await stripe.checkout.sessions.create({
            payment_method_types : ['card'],
            line_items : lineItems,
            mode : "payment",
            success_url : `${process.env.CLIENT_URL}/success`,
            cancel_url : `${process.env.CLIENT_URL}/failure`,
            customer : customer.id
        })

        const payment = new Payment(body)
        payment.userId = req.user.id
        payment.paymentType = "card"
        payment.stripTransactionId = session.id
        await payment.save()

        res.status(200).json({ "id": session.id, "url": session.url })
    }catch(err){
        res.status(500).json(err)
    }
}

paymentCltrs.update = async (req, res)=>{
    const { id } = req.params

    const io = await getIOInstance()

    try{
        const payment = await Payment.findOneAndUpdate(
            {"stripTransactionId": id}, {"paymentStatus": "successfull"}, {new: true}
            )

        const order = await Order.findOneAndUpdate(
            {"_id": payment.orderId}, {"amount": "Paid"}, {new: true}
        )
        

        if(!payment && order){
            return res.status(404).json({"msg": "Payment is unsuccessfull !, try again"})
        }

        const result = await Order.populate(
            order, [
                { 
                    path: "bookingId", select: "_id serviceProviderId",
                    populate: { path: "serviceProviderId", select: "serviceProviderName userId" }
                 }
            ]
        )

        const booking = await Booking.findByIdAndUpdate(
            {'_id': result.bookingId._id}, {'payment': true}, {new: true}
        )

        const paymentResponse = _.pick(booking, ["_id", "payment"])
        io.to(`${result.bookingId.serviceProviderId.userId}`).emit("updatePaymentStatus", paymentResponse)

        res.status(200).json({"oId": result._id, "serviceProvider": result.bookingId.serviceProviderId})
    }catch(err){
        res.status(500).json(err)
    }
}

paymentCltrs.delete = async (req, res)=>{
    const { id } = req.params

    try{
        const payment = await Payment.findOneAndDelete({"stripTransactionId": id})
        
        if(!payment){
            return res.status(404).json({"msg": "Not able to erase unsuccessfull payment record !"})
        }
        res.status(200).json({"msg": "Unsuccessfull payment record erased successfully !"})
    }catch(err){
        res.status(500).json(err)
    }
}

module.exports = paymentCltrs