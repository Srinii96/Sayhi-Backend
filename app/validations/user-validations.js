const User = require("../models/user-model")

const emailValidation = {
    notEmpty: {
        errorMessage: "Email is Required",
        bail: true
    },
    isString: {
        errorMessage: "Email must be a String",
        bail: true
    },
    trim: true,
    isEmail: {
        errorMessage: "Not a valid e-mail address",
        bail: true
    },
    isLowercase: {
        errorMessage: 'Email must be lowercase',
        bail: true
    }
}

const passwordValidation = {
        options: {minLength: 8, maxLength: 32, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1},
        errorMessage: "Password must be between 8 - 32 characters long and contain at least one lowercase letter,one uppercase letter, one number, and one symbol",
        bail: true
}

const registerValidation = {
    "firstName": {
        notEmpty: {
            errorMessage: "First name is Required",
            bail: true
        },
        isString: {
            errorMessage: "First name must be a String",
            bail: true
        },
        trim: true,
        isLength: {
            options: {min: 3},
            errorMessage: "First name should be min 3 characters",
            bail: true
        },
    },
    "lastName": {
        notEmpty: {
            errorMessage: "Last name is Required",
            bail: true
        },
        isString: {
            errorMessage: "Last name must be a String",
            bail: true
        },
        trim: true,
        isLength: {
            options: {min: 1},
            errorMessage: "Last name should be min 1 character",
            bail: true
        }
    },
    "email": {
        notEmpty: {
            errorMessage: "Email is Required",
            bail: true
        },
        isString: {
            errorMessage: "Email must be a String",
            bail: true
        },
        trim: true,
        isEmail: {
            errorMessage: "Not a valid e-mail address",
            bail: true
        },
        isLowercase: {
            errorMessage: 'Email must be lowercase',
            bail: true
        },
        custom: {
            options: async (value)=>{
                const user = await User.findOne({"email": value})
                if(user){
                    throw new Error(`A ${user.email} already exists with this e-mail address, try another.`)
                }else{
                    return true
                }
            },
            bail: true
        }
    },
    "password": {
        trim: true,
        isStrongPassword: passwordValidation,
    }
}

const loginValidation = {
    "email": emailValidation,
    "password": {
        trim: true,
        isStrongPassword: passwordValidation,
    }
}

const forgotPasswordEmailValidation = {
    "email": emailValidation
}

const resetPasswordValidation = {
    "password": {
        trim: true,
        isStrongPassword: passwordValidation,
    }
}

const updatePasswordValidation = {
    "mobileNumber": {
        trim: true,
        isLength: {
            options: { min: 10, max: 10 },
            errorMessage: 'Mobile number must be 10 digits',
            bail: true,
          }
    },
    "currentPassword": {
        trim: true,
        isStrongPassword: passwordValidation
    },
    "updatePassword": {
        trim: true,
        isStrongPassword: passwordValidation
    },
    
}

module.exports = {
    registerValidation, 
    loginValidation,
    forgotPasswordEmailValidation,
    updatePasswordValidation,
    resetPasswordValidation
}