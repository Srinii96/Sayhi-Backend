const addressValidation = {
    "doorNo": {
        notEmpty:{
            errorMessage:'Door No is required'
        }
    },
    "buildingName": {
        notEmpty:{
            errorMessage:'Building Name is required'
        }
    },
    "locality":{
        notEmpty:{
            errorMessage:'Locality is required'
        }
    },
    "landmark":{
        notEmpty:{
            errorMessage:'Landmark is required'
        }
    },
    "city":{
        notEmpty:{
            errorMessage:'City name is required'
        }
    },
    "state":{
        notEmpty:{
            errorMessage: 'State name is required'
        }
    },
    "pinCode":{
        notEmpty:{
            errorMessage: 'Pin code is required',
            bail: true
        },
        isLength: {
            options: {min: 6, max: 6},
            errorMessage: 'Pin code should be 6 digit number',
            bail: true
        },
        isNumeric: {
            errorMessage: 'Pin code must be number format',
            bail: true
        },
    }  
}

module.exports = addressValidation