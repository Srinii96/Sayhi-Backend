const { Schema, model } = require("mongoose")

const bookingSchema = new Schema({
    "customerName": String, 
    "email": String, 
    "mobileNumber": Number,
    "userId": {
        type: Schema.Types.ObjectId,
        ref: "User" 
    },
    "categoryId": {
        type: Schema.Types.ObjectId,
        ref: "Category" 
    },
    "serviceId": {
            type: Schema.Types.ObjectId,
            ref: "Service" 
    },
    "serviceProviderId": {
        type: Schema.Types.ObjectId, 
        ref: "ServiceProvider" 
    },
    "addressId": {
        type: Schema.Types.ObjectId, 
        ref: "Address"
    },
    "scheduleDate": Date,
    "scheduleTime": String,
    "addDetails": String,
    "bookingStatus": {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending"
    },
    "otp": {
        value: {
            type: String,
        },
        expiryTime: {
            type: Date,
        },
    },
    "isStarted": {
        type: Boolean,
        default: false
    },
    "isEnded": {
        type: Boolean,
        default: false
    },
    "payment": {
        type: Boolean,
        default: false 
    }
}, {timestamps: true})

const Booking = model("Booking", bookingSchema)
module.exports = Booking