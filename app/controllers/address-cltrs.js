const Address = require("../models/address-model")
const User = require("../models/user-model")
const { validationResult } = require("express-validator")
const _ = require("lodash")
const axios = require("axios")

const addressCltrs = {}

// create
addressCltrs.create = async (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({"errors": errors.array()})
    }
    const body = _.pick(req.body, ["doorNo", "buildingName", "locality", "landmark", "city", "state", "pinCode"])
    const {id, email} = req.user
    try {
        const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${body.pinCode}&key=${process.env.GEO_CODING_API}`)
        
        const result = response.data.results[0]
        const {lat, lng} = result.geometry

        if(lat & lng){
            body.location = {type:'Point',coordinates:[lat, lng]}
            body.userId = id
            const address = new Address(body)
            await User.findOneAndUpdate({"_id": id, email}, {$push: {"address": address._id}})
            const saved = await address.save()
            res.status(201).json(saved)
        }else{
            res.status(400).json({ error: "Invalid pin code" })
        }
    }catch(err){
        res.status(500).json(err)
    }
}

// update
addressCltrs.update = async (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({"errors": errors.array()})
    }
    const body = _.pick(req.body, ["doorNo", "buildingName", "locality", "landmark", "city", "state", "pinCode"])
    const { id } = req.params
    const userId = req.user.id
    try {
        const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${body.pinCode}&key=${process.env.GEO_CODING_API}`)
        
        const result = response.data.results[0]
        const {lat, lng} = result.geometry

        if(lat & lng){
            body.location = {type:'Point', coordinates:[lat, lng]}
            const address = await Address.findOneAndUpdate({"_id": id, userId}, body, {new: true})
            res.status(200).json(address)
        }else{
            res.status(400).json({ error: "Invalid pin code" })
        }
    }catch(err){
        res.status(500).json(err)
    }
}

module.exports = addressCltrs