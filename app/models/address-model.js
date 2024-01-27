const { Schema, model } = require("mongoose")

const addressSchema = new Schema({
    "doorNo": String,
    "buildingName": String,
    "locality": String,
    "landmark": String,
    "city": String,
    "state": String,
    "pinCode": Number,
    "country": { 
        type: String, 
        default: "India"
    },
    "location":{
        type:{
            type:String,
            enum:['Point']
        },
        coordinates: {
            type:[Number]  //geospatial data
        }
    },
    "userId": {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})

const Address = model("Address", addressSchema)

module.exports = Address