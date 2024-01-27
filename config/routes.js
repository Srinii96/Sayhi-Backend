const router = require("express").Router()
const upload = require("./multerConfig")
const { checkSchema } = require("express-validator")

const authenticateUser = require("../app/middlewares/user-authentication")
const authorizeUser = require("../app/middlewares/user-authorize")

// validations
const { registerValidation, 
    loginValidation,
    forgotPasswordEmailValidation, 
    updatePasswordValidation,
    resetPasswordValidation 
} = require("../app/validations/user-validations")
const addressValidation = require("../app/validations/address-validation")
const categoryValidation = require("../app/validations/category-validations")
const serviceValidation = require("../app/validations/service-validations")
const serviceProviderValidation = require("../app/validations/service-provider-validation")
const bookingValidation = require("../app/validations/booking-validation")
const paymentValidation = require("../app/validations/payment-validation")
const reviewValidations = require("../app/controllers/review-cltrs")

// controllers
const userCltrs = require("../app/controllers/user-cltrs")
const addressCltrs = require("../app/controllers/address-cltrs")
const categoryCltrs = require("../app/controllers/category-cltrs")
const serviceCltrs = require("../app/controllers/service-cltrs")
const serviceProviderCltrs = require("../app/controllers/service-provider-cltrs")
const bookingCltrs = require("../app/controllers/booking-cltrs")
const orderCltrs = require("../app/controllers/order-cltrs")
const paymentCltrs = require("../app/controllers/payment-cltrs")
const reviewCltrs = require("../app/controllers/review-cltrs")

// user model restfull api's
// Register Route
router.post("/user-register", 
    checkSchema(registerValidation), 
    userCltrs.register
)
// Login Route
router.post("/user-login", 
    checkSchema(loginValidation), 
    userCltrs.login
)
// forgot password
router.post("/forgot-password",
    checkSchema(forgotPasswordEmailValidation),
    userCltrs.forgotPassword
)
// reset password
router.post("/reset-password/:token", 
    checkSchema(resetPasswordValidation),
    userCltrs.resetPassword
)
// user data
router.get("/user-data", 
    authenticateUser, 
    userCltrs.showOne
)
// user verify
router.get('/verify-email/:userId', userCltrs.verifyEmail)
// update profile pic
router.put("/profile-picture", 
    authenticateUser, 
    upload.single("profilePicture"), 
    userCltrs.updateProfilePicture
)
// update user profile
router.put("/update-profile/:id", 
    authenticateUser, 
    checkSchema(updatePasswordValidation), 
    userCltrs.updateProfile
)


// addess model restfull api's
// create
router.post("/user-address", 
    authenticateUser, checkSchema(addressValidation), 
    authorizeUser(["user", "technician", "selfEmployee"]), 
    addressCltrs.create
)
// update
router.put("/user-address/:id", 
    authenticateUser, 
    checkSchema(addressValidation),
    authorizeUser(["user", "technician", "selfEmployee"]), 
    addressCltrs.update
)


// category model restfull api's
router.get("/category", categoryCltrs.list)
// add category
router.post("/category", 
    authenticateUser, 
    authorizeUser(["admin"]), 
    upload.single("picture"), 
    checkSchema(categoryValidation), 
    categoryCltrs.create
)
// show one
router.get("/category/:id", authenticateUser, categoryCltrs.showOne)


// service model restfull api's
// list
router.get("/service", serviceCltrs.list)
// create
router.post("/service", checkSchema(serviceValidation), serviceCltrs.create)


// service provider model restfull api's
// list for admin approval
router.get("/service-provider", 
    authenticateUser, 
    authorizeUser(["admin"]), 
    serviceProviderCltrs.listForAdmin
)
// create service
router.post("/service-provider", 
    authenticateUser, 
    authorizeUser(["user"]), 
    upload.single("authorisedDealer"), 
    checkSchema(serviceProviderValidation), 
    serviceProviderCltrs.create
)
// list for users
router.get("/service-provider/:id", 
    authenticateUser, 
    serviceProviderCltrs.listForUser
)
// admin approval update
router.put("/service-provider/:id/:response", 
    authenticateUser, 
    authorizeUser(["admin"]), 
    serviceProviderCltrs.updateService
)


// booking model restfull api's
// list bookings
router.get("/service-booking", 
    authenticateUser, 
    authorizeUser(["technician", "selfEmployee"]), 
    bookingCltrs.list
)
// list accepted
router.get("/service-booking/accepted", 
    authenticateUser, 
    authorizeUser(["technician", "selfEmployee"]), 
    bookingCltrs.listAccepted
)
// create
router.post("/service-booking", 
    authenticateUser, 
    authorizeUser(["user"]), 
    checkSchema(bookingValidation), 
    bookingCltrs.create
)
// update status
router.put("/service-booking/:id/:response",
    authenticateUser,
    authorizeUser(["technician", "selfEmployee"]),
    bookingCltrs.updateStatus
)

// order model restfull api's
//list
router.get("/orders", 
    authenticateUser, 
    authorizeUser(["user"]), 
    orderCltrs.list
)
// show one
router.get("/orders/:oId/:bId", 
    authenticateUser, 
    authorizeUser(["user"]), 
    orderCltrs.showOne
)
// update status
router.put("/orders/:id/:response", 
    authenticateUser, 
    authorizeUser(["technician", "selfEmployee"]), 
    orderCltrs.updateStatus
)

// payment model restfull api's
// create
router.post("/payment", 
    authenticateUser, 
    authorizeUser(["user"]), 
    checkSchema(paymentValidation), 
    paymentCltrs.create
)
// update
router.put("/payment/:id", 
    authenticateUser, 
    authorizeUser(["user"]), 
    paymentCltrs.update
)
// delete
router.delete("/payment/:id", 
    authenticateUser, 
    authorizeUser(["user"]), 
    paymentCltrs.delete
)

// payment model restfull api's
// create
router.post("/reviews",
    authenticateUser,
    authorizeUser(["user"]),
    checkSchema(reviewValidations),
    reviewCltrs.create
)

module.exports = router