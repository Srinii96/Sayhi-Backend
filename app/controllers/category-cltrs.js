const { validationResult } = require("express-validator")
const _ = require("lodash")
const Category = require("../models/category-model")
const uploadToS3 = require("../../config/aws-s3-bucket")
const { getIOInstance } = require("../../config/socketConfig")


const categoryCltrs = {}

// create
categoryCltrs.create = async (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({"error": errors.array()})
    }
    const body = _.pick(req.body, ["title", "picture"])

    try {
        
        if(req.file){
            const uploadAwsImage = await uploadToS3(req.file, req.user.id)
            body.picture = uploadAwsImage
        }

        const category = await Category.create(body)
        res.status(201).json(category)
    }catch(err){
        res.status(500).json(err)
    }
}

// read
categoryCltrs.list = async (req, res)=>{
    try{
        const categories = await Category.find().populate({
            path: "serviceIds", select: "serviceName"})
        res.status(200).json(categories)

        const io = await getIOInstance()
        io.emit("Heloo", categories)
    }catch(err){
        res.status(500).json(err)
    }
}

// showOne
categoryCltrs.showOne = async(req, res)=>{
    const { id } = req.params
    try{
        const category = await Category.findById(id).populate({ path: 'serviceIds', select: 'serviceName'})
        if(category){
            res.status(200).json(category)
        }else{
            res.status(200).json({})
        }
    }catch(err){
        res.status(500).json(err)
    }
}

module.exports = categoryCltrs