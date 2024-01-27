const Service = require("../models/service-model")

const serviceValidation = {
    "serviceName": {
        notEmpty: {
            errorMessage: "Service type is required",
            bail: true
        },
        custom: {
            options: async (value)=>{
                const isValid = value.charAt(0) === value.charAt(0).toUpperCase()
            
                if (!isValid) {
                    throw new Error('Each service name should start with a capital letter')
                }

                const service = await Service.findOne({ "serviceName": { "$regex": value } })

                if (service) {
                      throw new Error(`Service name '${value}' already exists`)
                }

                return true
            },
            bail: true
        }
    },
    "categoryId": {
        in: ["body"],
        notEmpty: {
            errorMessage: "Category Id is required",
            bail: true
        },
        isMongoId: {
            errorMessage: "Category Id should be a valid id",
            bail: true
        }
    }
}

module.exports = serviceValidation




