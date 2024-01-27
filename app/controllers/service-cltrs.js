const { validationResult } = require("express-validator")
const _ = require("lodash")
const Service = require("../models/service-model")
const Category = require("../models/category-model")

const serviceCltrs = {}

// create
serviceCltrs.create = async (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
      return res.status(400).json({"errors": errors.array()})
    }
    const body = _.pick(req.body, ["serviceName", "categoryId"])
    try {
        const service = await Service.create(body)
        res.status(201).json(service)
    } catch(err){
        res.status(500).json(err)
    }
}

// read
serviceCltrs.list = async (req, res)=>{
    try {
        const services = await Service.find()
        res.status(201).json(services)
    } catch(err){
        res.status(500).json(err)
    }
}

module.exports = serviceCltrs