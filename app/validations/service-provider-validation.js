const ServiceProvider = require("../models/service-provider-model")

const serviceProviderValidation = {
    "serviceProviderName": {
        notEmpty: {
            errorMessage: "Service provider name is Required",
            bail: true
        },
        isString: {
            errorMessage: "Service provider name must be a String",
            bail: true
        },
        trim: true,
        isLength: {
            options: {min: 3},
            errorMessage: "Service provider should be min 3 characters",
            bail: true
        },
        custom: {
            options: async (value)=>{
                const name = await ServiceProvider.findOne({"serviceProviderName": {"$regex": value, "$options": "i"}})
                if(name){
                    throw new Error(`${value} already exist, try another.`)
                }else{
                    return true
                }
            },
            bail: true
        }
    },
    "description": {
        notEmpty: {
            errorMessage: "about service provider info is Required",
            bail: true
        },
        isString: {
            errorMessage: "about service provider must be a String",
            bail: true
        },
        trim: true,
        isLength: {
            options: {min: 5},
            errorMessage: "about service provider should be min 5 characters",
            bail: true
        }
    },
    "categoryId": {
        notEmpty: {
            errorMessage: "Category Id is required",
            bail: true
        },
        isMongoId: {
            errorMessage: "Category Id should be a valid id",
            bail: true
        },
        custom: {
            options: async (value, {req})=>{
                const category = await ServiceProvider.findOne({"categoryId": value, "userId": req.user.id})
                if(category){
                    throw new Error(`Service already exist with your registered id as ${category.serviceProviderName}`)
                }else{
                    return true
                }
            },
            bail: true
        }
    },
    "serviceIds": {
        isArray: {
            errorMessage: "Value should be array",
            bail: true
        },
        isMongoId: {
            errorMessage: "Should be a valid Id",
            bail: true
        }
    },
    "serviceType": {   
        custom: {
            options: async (value)=>{
                if(value.length >= 1){
                    return true
                }else{
                    throw new Error("Atleast one service type is required")
                }
            },
            bail: true
        },
        isIn: {
            options: [["home", "business", "corporate"]],
            errorMessage: 'service type should be either Home, Business, or Corporate'
        }
    },
    "authorisedDealer": {
        custom: {
            options: async (value, {req})=>{
                if(!req.file){
                    throw new Error("Please upload an image")
                }
                // Check file type (adjust allowedTypes as needed)
                const allowedType = ["image/jpeg"]

                if(!allowedType.includes(req.file.mimetype)){
                    throw new Error('Only JPEG images are allowed')
                }
                // Check file size (adjust maxSizeInBytes as needed)
                const maxSizeInBytes = 3 * 1024 * 1024; // 3MB

                if (req.file.size > maxSizeInBytes) {
                    throw new Error('Image size exceeds 3MB limit')
                }
            },
            errorMessage: 'Not a valid image',
            bail: true,
        }
    },
    "user": {
        custom: {
            options: async (value, {req})=>{
                const serviceProvider = await ServiceProvider.findOne({"userId": req.user.id})
                if(serviceProvider){
                    throw new Error("you have already registed your service & limited to only one.")
                }else{
                    return true
                }
            }
        }
    }
}

module.exports = serviceProviderValidation