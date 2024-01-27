const { Schema, model } = require("mongoose")

const paymentSchema = new Schema({
    "userId": {
        type: Schema.Types.ObjectId,
        ref: "User" 
    },
    "bookingId": {
        type: Schema.Types.ObjectId,
        ref: "Booking" 
    },
    "orderId": {
        type: Schema.Types.ObjectId,
        ref: "Order" 
    },
    "amount": Number,
    "paymentType": String,
    "stripTransactionId": {
        type: String,
        default: null
    },
    "paymentStatus": {
        type: String,
        enum: ['pending', 'successfull'],
        default: "pending"
    }
}, {timestamps: true})

const Payment = model("Payment", paymentSchema)

module.exports = Payment