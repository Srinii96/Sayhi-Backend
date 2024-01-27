const { Schema, model } = require("mongoose")

const locationSchema = new Schema({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // Coordinates as an array of numbers [longitude, latitude]
      index: '2dsphere',
    },
})

const serviceProviderSchema = new Schema({
    "serviceProviderName": String,
    "description": String,
    "categoryId": {
        type: Schema.Types.ObjectId,
        ref: "Category"
    },
    "serviceIds": [
        {
            type: Schema.Types.ObjectId,
            ref: "Service"
        }
    ],
    "userId": {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    "serviceType": [String],
    "authorisedDealer": {                                 
        url:String,
        key:String
    },
    "locations": [locationSchema], // Array of location objects
    "isActive": {
        type: Boolean,
        default: true
    },
    "isApproved": {
        type: Boolean,
        default: false
    },
    "isRejected": {
        type: Boolean,
        default: false
    },
    "reviewId": {
        type: Schema.Types.ObjectId, 
        ref: "Review" 
    }
}, {timestamps: true})


const ServiceProvider = model("ServiceProvider", serviceProviderSchema)
module.exports = ServiceProvider