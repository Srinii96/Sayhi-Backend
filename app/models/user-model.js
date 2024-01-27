const {Schema, model} = require("mongoose")

const userSchema = new Schema({
    "firstName": String,
    "lastName": String,
    "email": String,
    "password": String,
    "role": {
        type: String,
        enum: ["admin", "technician", "selfEmployee", "user"],
        default: "user"
    },
    "gender": {
        type: String,
        enum: ["male", "female"]
    },
    "serviceProvider": [{
        type: Schema.Types.ObjectId, 
        ref: "ServiceProvider"
    }],
    "profilePicture": {                                 
        url:String,
        key:String
    },
    "mobileNumber": String,
    "address": [{
        type: Schema.Types.ObjectId, 
        ref: "Address"
    }],
    "isVerified": {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

const User = model("User", userSchema)
module.exports = User