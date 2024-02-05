const User = require("../models/user-model")
const { validationResult } = require("express-validator")
const _ = require("lodash")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const uploadToS3 = require("../../config/aws-s3-bucket")


const userCltrs = {}

// Initialise nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.G_MAIL,
    pass: process.env.G_PASS
  }
})

// Check for initialisation status
transporter.verify((err, success)=>{
  if(err){
    console.log("Nodemailer initialisation : ", err.message)
  } else{
    console.log("Nodemailer is ready for messages")
  }
})

// register a user
userCltrs.register = async (req, res)=>{
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(400).json({"error": errors.array()})
  }
  const body = _.pick(req.body, ["firstName", "lastName", "email", "password"])
  try{
    const salt = await bcryptjs.genSalt()
    body.password = await bcryptjs.hash(body.password, salt)
    const user = new User(body)
    const usersCount = await User.countDocuments()
    if(usersCount == 0) {
      user.role = "admin"
    }
    await user.save()
    const encryptedUserId = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "1h"})
    transporter.sendMail({
      from: process.env.G_MAIL,
      to: `${user.email}`,
      subject: "Service At Your Home user register verification email",
      text: `Hello ${user.firstName}!, Welcome to Service At Your Home Family. Click the following link to verify your email: ${process.env.CLIENT_URL}/api/verify-email/${encryptedUserId}`,
      html: `
        <p>Hello ${user.firstName}!,</p>
        <p>Welcome to Service At Your Home Family. Please click the link below to verify your email:</p>
        <p><a href='${process.env.CLIENT_URL}/api/verify-email/${encryptedUserId}'>Click here to verify your email.</a></p>
      `
    })    
    res.status(201).json({msg:`${user.firstName} registered Successfully! Please check your email to verify.`})
  }catch(err){
    res.status(500).json(err)
  }
}

// login a user
userCltrs.login = async (req, res)=>{
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(400).json({"error": errors.array()})
  }
  const body = _.pick(req.body, ["email", "password"])

  try {
    const user = await User.findOne({"email": body.email})

    if(!user){
      return res.status(404).json({error: "Not a valid e-mail or password"})
    }

    if(!user.isVerified){
      return res.status(404).json({error:"Email is not verified. Please check your mail to verify."})
    }

    const match = await bcryptjs.compare(body.password, user.password)
    if(!match){
      return res.status(404).json({error: "Not a valid e-mail or password"})
    }

    if(user.role === "technician" || "selfEmployee"){
      const tokenData = {"id": user._id, "role": user.role, "email": user.email, "serviceProviderId": user.serviceProvider[0]}
      const token = jwt.sign(tokenData, process.env.JWT_SECRET, {expiresIn: "1d"})
      return res.status(200).json({"token" : `Bearer ${token}`})
    }

    const tokenData = {"id": user._id, "role": user.role, "email": user.email}
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, {expiresIn: "1d"})
    res.status(200).json({"token" : `Bearer ${token}`})
  }catch(err){
    res.status(500).json(err) 
  }
}

//verify user email
userCltrs.verifyEmail = async (req, res) => { 
  const encryptedUserId = req.params.userId 
  let userId

  try{
    const id = jwt.verify(encryptedUserId, process.env.JWT_SECRET)
    userId = id.userId
  }catch(err){
    return res.status(400).send("Sorry, we think you are lost.")
  }

  try{
    const user = await User.findByIdAndUpdate(userId, {isVerified: true}, {new: true})
    const message = `${user.firstName} verified successfully. Please log in.`
    // Redirect with the message as a query parameter
    res.redirect(`${process.env.CLIENT_URL}/sign-in?message=${encodeURIComponent(message)}`)
  }catch(err){
    res.status(500).json(err)
  } 
}

// forgot password
userCltrs.forgotPassword = async (req, res)=>{
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(400).json({"error": errors.array()})
  }

  const body = _.pick(req.body, ["email"])
  try{
    const user = await User.findOne({"email": body.email})

    if(!user){
      return res.status(404).json({error: "Not a valid e-mail"})
    }

    const tokenData = {"id": user._id, "role": user.role, "email": user.email}
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, {"expiresIn": "30m"})

    transporter.sendMail({
      from: process.env.G_MAIL,
      to: `${user.email}`,
      subject: "Service At Your Home user reset password email",
      text: `Hello ${user.firstName}!, Welcome to Service At Your Home Family. Click the following link to reset your password: ${process.env.CLIENT_URL}/reset-password/${token}`,
      html: `
        <p>Hello ${user.firstName}!,</p>
        <p>Welcome to Service At Your Home Family. Please click on the link below to reset your password:</p>
        <p><a href='${process.env.CLIENT_URL}/reset-password/${token}'>Click here !</a></p>
      `
    }) 
    res.status(200).json({msg: "reset password link sent to your email!"})
  }catch(err){
    res.status(500).json(err)
  }
}

// reset password 
userCltrs.resetPassword = async (req, res)=>{
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(400).json({"error": errors.array()})
  }

  const { token } = req.params
  const body = _.pick(req.body, ["password"])
  const tokenData = jwt.verify(token, process.env.JWT_SECRET)
  const {id, email, role} = tokenData
  try{
    const salt = await bcryptjs.genSalt()
    const hashPassword = await bcryptjs.hash(body.password, salt)
    const user = await User.findOneAndUpdate(
      {"_id": id}, {"password": hashPassword}, {new: true} 
      )
    console.log(user)

    if(!user){
      return res.status(404).json({error: "Not a valid user"})
    }

    res.status(200).json({msg: "Reset password success!"})
  }catch(err){
    res.status(500).json(err)
  }
}

// Get user data
userCltrs.showOne = async (req, res)=>{
  const { id, email, role } = req.user
  try {
    const user = await User.findOne({
      "_id": id, email
    }).populate({
      path: "address",
      match: { userId: id} 
    })
    if(user){
      const result = _.pick(user, "_id", "firstName", "lastName", "email", "role", "profilePicture", "mobileNumber", "address")
      res.status(200).json(result)
    }else{
      res.status(404).json({})
    }
  }catch(err){
    res.status(500).json(err)
  }
}

//update profile Picture
userCltrs.updateProfilePicture = async (req, res)=>{
  const errors = validationResult(req)
  
  if(!errors.isEmpty()){
    return res.status(400).json({"error": errors.array()})
  }

  const { id, email, role } = req.user

  try {
    let profile
    if(req.file){
      const uploadAwsImage = await uploadToS3(req.file, req.user.id)
      profile = uploadAwsImage
    }

    if(profile){
      const user = await User.findByIdAndUpdate({"_id": id, email, role}, {"profilePicture": profile}, {new: true})
      if(user){
        res.status(200).json(_.pick(user, "profilePicture"))
      }else{
        res.status(404).json({})
      }
    }
  }catch(err){
    res.status(500).json(err)
  }
}

// update user profile
userCltrs.updateProfile = async (req, res)=>{
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(400).json({"error": errors.array()})
  }
  const body = _.pick(req.body, ["firstName", "lastName", "currentPassword", "updatePassword", "mobileNumber"])
  const {email, id, role} = req.user

  try {
    const user = await User.findOne({_id: req.user.id})
    if(!user){
      return res.status(404).json({"error": "Account not found"})
    }
    if(body.currentPassword === body.updatePassword){
      return res.status(400).json({"error": "update password should not be same"})
    }
    const match = await bcryptjs.compare(body.currentPassword, user.password)
    if(!match){
      return res.status(404).json({"error": "Invalid current password"})
    }
    const salt = await bcryptjs.genSalt()
    const newPassword = await bcryptjs.hash(body.updatePassword, salt)
    const { mobileNumber } = await User.findOneAndUpdate(
      {"_id": id, email, role}, 
      {"password": newPassword, "mobileNumber": body.mobileNumber}, 
      {new: true}
    )
    res.status(200).json({"msg": "Successfully updated !", mobileNumber})
  } catch(err){
    res.status(500).json(err)
  }
}


module.exports = userCltrs

