const { Schema, model } = require("mongoose")

const serviceSchema = new Schema({
    "serviceName": String,
    "categoryId": {
        type: Schema.Types.ObjectId,
        ref: "Category"
    }
}, {timestamps: true})

const Service = model("Service", serviceSchema)

module.exports = Service