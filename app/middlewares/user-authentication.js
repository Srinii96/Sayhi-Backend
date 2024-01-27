const jwt = require("jsonwebtoken")

const authenticateUser = async (req, res, next)=>{
    let token = req.headers["authorization"]
    if(!token){
        return res.status(401).json({errors: "Authentication failed, Please do log in."})
    }
    token = token.split(" ")[1]

    try{
        const tokenData = jwt.verify(token, process.env.JWT_SECRET)
        req.user = tokenData
        next()
    } catch(err){
        res.status(401).json(err)
    }
}

module.exports = authenticateUser