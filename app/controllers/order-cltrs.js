const Order = require("../models/order-status-model")
const Booking = require("../models/booking-model")
const _ = require("lodash")
const { getIOInstance } = require("../../config/socketConfig")

const orderCltrs = {}

// list
orderCltrs.list = async (req, res)=>{
    try{
        const orders = await Order.find(
            {"userId": req.user.id, "amount": "unPaid"}
            )
            .populate("bookingId")
            .populate({
                path: "bookingId",
                populate: {
                    path: "categoryId",
                    select: "title"
                }
            })
            .populate({
                path: "bookingId",
                populate: {
                    path: "serviceId",
                    select: "serviceName"
                }
            })
            .populate({
                path: "bookingId",
                populate: {
                    path: "serviceProviderId",
                    select: "serviceProviderName",
                    populate: {
                        path: "userId",
                        select: "profilePicture.url"
                    },

                }
            })
            .populate({
                path: "bookingId",
                populate: {
                    path: "addressId",
                    select: "doorNo buildingName city", 
                }
            })
        res.status(200).json(orders)
    }catch(err){
        res.status(500).json(err)
    }
}

// show one
orderCltrs.showOne = async (req, res)=>{
    const { oId, bId } = req.params
    
    try {
        const order = await Order.findOne({
            "_id": oId, "bookingId": bId
        })
        .populate("bookingId")
        .populate({
            path: "bookingId",
            populate: {
                path: "categoryId",
                select: "title"
            }
        })
        .populate({
            path: "bookingId",
            populate: {
                path: "serviceId",
                select: "serviceName"
            }
        })
        .populate({
            path: "bookingId",
            populate: {
                path: "serviceProviderId",
                select: "serviceProviderName",
                populate: {
                    path: "userId",
                    select: "profilePicture.url"
                },

            }
        })
        .populate({
            path: "bookingId",
            populate: {
                path: "addressId",
                select: "doorNo buildingName city", 
            }
        })
        if(order){
            res.status(200).json(order)
        }else{
            res.status(404).json({})
        }
    } catch(err){
        res.status(500).json(err)
    }
}

// update status
orderCltrs.updateStatus = async (req, res)=>{
    const {id, response} = req.params
    const io = await getIOInstance()

    try{
        if(response === "accept"){
            const order = await Order.findOneAndUpdate(
                {"bookingId": id}, {"orderStatus": "Accepted"}, {new: true}
            )
            const booking = await Booking.findOneAndUpdate(
                {"_id": id}, {"bookingStatus": "Accepted"}, {new: true}
            )
            const result = await Order.populate(
                order, [
                    {
                        path: "bookingId", select: "serviceProviderId", 
                        populate: { path: "serviceProviderId categoryId serviceId", select: "serviceProviderName title serviceName" }
                    }
                ]
            )


            const statusResponse = _.pick(result, ["_id", "orderStatus"])
            io.to(`${result.userId}`).emit("updateOrderStatus", statusResponse)

            io.to(`${result.userId}`)
            .emit("approved", 
                `${result.bookingId.serviceProviderId.serviceProviderName} has been accepted your ${result.bookingId.categoryId.title} - ${result.bookingId.serviceId.serviceName} booking.`
            )
            
            res.status(200).json({"id": booking._id, result})
        }else{
            const order = await Order.findOneAndUpdate(
                {"bookingId": id}, {"orderStatus": "Rejected"}, {new: true}
            )
            const booking = await Booking.findOneAndUpdate(
                {"_id": id}, {"bookingStatus": "Rejected"}, {new: true}
            )
            const result = await Order.populate(
                order, [
                    {
                        path: "bookingId", select: "serviceProviderId", 
                        populate: { path: "serviceProviderId categoryId serviceId", select: "serviceProviderName title serviceName" }
                    }
                ]
            )

            const statusResponse = _.pick(result, ["_id", "orderStatus"])
            io.to(`${result.userId}`).emit("updateOrderStatus", statusResponse)

            io.to(`${result.userId}`)
            .emit("rejected", 
                `${result.bookingId.serviceProviderId.serviceProviderName} has been rejected your ${result.bookingId.categoryId.title} - ${result.bookingId.serviceId.serviceName} booking, try another.`
            )
            res.status(200).json({"id": booking._id})
        }
    }catch(err){
        res.status(500).json(err)
    }
}

module.exports = orderCltrs