const paymentValidation = {
    "amount": {
        notEmpty: {
            errorMessage: "Amount is Required",
            bail: true
        },
        isNumeric: {
            errorMessage: 'Amount should be Numeric',
            bail: true
        },
        trim: true,
    },
    "bookingId": {
        isMongoId: {
            errorMessage: "Booking Id should be a valid id",
            bail: true
        },
        trim: true,
    },
    "orderId": {
        isMongoId: {
            errorMessage: "Order Id should be a valid id",
            bail: true
        },
        trim: true,
    }
}

module.exports = paymentValidation