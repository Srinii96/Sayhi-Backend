const bookingValidation = {
    "customerName": {
        notEmpty: {
            errorMessage: "Customer name is required"
        },
        trim: true,
    }, 
    "email": {
        notEmpty: {
            errorMessage: "Email is required"
        },
        trim: true,
    }, 
    "mobileNumber": {
        trim: true,
        isLength: {
            options: { min: 10, max: 10 },
            errorMessage: 'Mobile number must be 10 digits',
            bail: true,
        }
    },
    "categoryId": {
        notEmpty: {
            errorMessage: "Category Id is required",
            bail: true
        },
        trim: true,
        isMongoId: {
            errorMessage: "Category Id should be a valid id",
            bail: true
        }
    },
    "serviceId": {
        notEmpty: {
            errorMessage: "Service Id is required",
            bail: true
        },
        trim: true,
        isMongoId: {
            errorMessage: "Service Id should be a valid id",
            bail: true
        }
    },
    "serviceProviderId": {
        notEmpty: {
            errorMessage: "Service Provider Id is required",
            bail: true
        },
        trim: true,
        isMongoId: {
            errorMessage: "Service Provider Id should be a valid id",
            bail: true
        }
    },
    "addressId": {
        notEmpty: {
            errorMessage: "Address Id is required",
            bail: true
        },
        trim: true,
        isMongoId: {
            errorMessage: "Address Id should be a valid id",
            bail: true
        }
    },
    "scheduleDate": {
        notEmpty: {
            errorMessage: "Date is required",
            bail: true
        },
        trim: true,
        isISO8601: {
            errorMessage: "Invalid date format",
            bail: true
        }
    },
    "scheduleTime": {
        notEmpty: {
            errorMessage: "Time slot is required",
        },
        trim: true,
    }
}

module.exports = bookingValidation