const { Schema, model } = require("mongoose")

const reviewSchema = new Schema({
    "comment": String,
    "rating": Number,
    "userId": {
        type: Schema.Types.ObjectId,
        ref: "User" 
    },
    "orderId": {
        type: Schema.Types.ObjectId,
        ref: "Order" 
    },
    "serviceProviderId": {
        type: Schema.Types.ObjectId, 
        ref: "ServiceProvider" 
    },
}, {timestamps: true})

const Review = model("Review", reviewSchema)
module.exports = Review