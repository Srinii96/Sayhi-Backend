const { Schema, model } = require("mongoose")

const categoriesSchema = new Schema({
    "title": String,
    "picture": {                                 
        url:String,
        key:String
    },
    "serviceProviderIds": [
        {
            type: Schema.Types.ObjectId,
            ref: "ServiceProvider"
        }
    ],
    "serviceIds": [
        {
            type: Schema.Types.ObjectId,
            ref: "Service"
        }
    ],
    "ServiceProviderId": {
        type: Schema.Types.ObjectId, 
        ref: "ServiceProvider" 
    }
}, {timestamps: true})

const Category = model("Category", categoriesSchema)

module.exports = Category