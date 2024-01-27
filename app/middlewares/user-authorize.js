const authorizeUser = (roles)=>{
    return (req, res, next)=>{
        if(roles.includes(req.user.role)){
            next()
        }else{
            res.status(403).json({error : "You are unAuthorized to access this link"})
        }
    }
}

module.exports = authorizeUser