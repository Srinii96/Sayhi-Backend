const { Schema, model } = require("mongoose")

const orderSchema = new Schema({
    "bookingId": {
        type: Schema.Types.ObjectId,
        ref: "Booking"
    },
    "userId": {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    "orderStatus": {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending"
    },
    "amount": {
        type: String,
        enum: ["Paid", "unPaid"],
        default: "unPaid"
    },
    "paymentId": {
        type: Schema.Types.ObjectId,
        ref: "Payment"
    }
}, {timestamps: true})

const Order = model("Order", orderSchema)
module.exports = Order