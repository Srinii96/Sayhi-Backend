const Category = require("../models/category-model")

const categoryValidation = {
    "title": {
        notEmpty: {
            errorMessage: "Category name is required",
            bail: true
        },
        trim: true,
        isLength: {
            options: {min: 2},
            errorMessage: "Category name must be min 2 characters",
            bail: true
        },
        custom: {
            options: async (value)=>{
                const isValid = value.charAt(0) === value.charAt(0).toUpperCase()
            
                if (!isValid) {
                    throw new Error('Category name should start with a capital letter')
                }

                const title = await Category.findOne({"title": {"$regex": value, "$options": "i"}})
                if(title){
                    throw new Error(`${value} already exist`)
                }else{
                    return true
                }
            }
        }
    },
    "picture": {
        custom: {
            options: async (value, {req})=>{
                if(!req.file){
                    throw new Error("Please upload an image")
                }
                // Check file type (adjust allowedTypes as needed)
                const allowedType = ["image/png", "image/jpeg"]

                if(!allowedType.includes(req.file.mimetype)){
                    throw new Error('Only JPEG, and PNG images are allowed')
                }

                // Check file size (adjust maxSizeInBytes as needed)
                const maxSizeInBytes = 2 * 1024 * 1024; // 2MB

                if (req.file.size > maxSizeInBytes) {
                    throw new Error('Image size exceeds 2MB limit')
                }
            },
            bail: true,
        }
    }
}

module.exports = categoryValidation