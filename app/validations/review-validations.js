const reviewValidations = {
    "comment": {
        notEmpty: {
            errorMessage: "Comment is Required",
            bail: true
        },
        isString: {
            errorMessage: "Comment must be a String",
            bail: true
        },
        trim: true,
    },
    "rating": {
        notEmpty: {
            errorMessage: "rating is Required",
            bail: true
        },
        isNumeric: {
            errorMessage: "rating must be in numeric",
            bail: true
        },
        isLength: {
            options: {min: 1, max: 5},
            errorMessage: "atleast min 1 rating is required",
            bail: true
        }
    },
    "orderId": {
        notEmpty: {
            errorMessage: "Order Id is required",
            bail: true
        },
        isMongoId: {
            errorMessage: "Order Id should be a valid id",
            bail: true
        }
    },
    "serviceProviderId": {
        notEmpty: {
            errorMessage: "Service Provider Id is required",
            bail: true
        },
        isMongoId: {
            errorMessage: "Service Provider Id should be a valid id",
            bail: true
        }
    }
}

module.exports = reviewValidations