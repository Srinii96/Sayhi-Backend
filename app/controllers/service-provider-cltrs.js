const { validationResult } = require("express-validator")
const _ = require("lodash")
const uploadToS3 = require("../../config/aws-s3-bucket")
const ServiceProvider = require("../models/service-provider-model")
const Category = require("../models/category-model")
const User = require("../models/user-model")
const { getIOInstance } = require("../../config/socketConfig")

const serviceProviderCltrs = {}

// list for admin approval
serviceProviderCltrs.listForAdmin = async (req, res)=>{ 
    try {
        const services = await ServiceProvider.find(
            { "isApproved": false, "isRejected": false }
            )
            .populate({
                path: "categoryId",
                select: "title"
            })
            .populate({
                path: "serviceIds",
                select: "serviceName"
            })
        res.status(200).json(services)
    } catch(err){
        res.status(500).json(err)
    }
}

// create
serviceProviderCltrs.create = async (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
      return res.status(400).json({"error": errors.array()})
    }
    
    const body = _.pick(req.body, ["serviceProviderName", "description", "categoryId", "serviceIds", "serviceType", "role", "authorisedDealer", "locations"])
     
    body.locations = body.locations.map(loc => ({
        type: loc.type,
        coordinates: [loc.coordinates[0], loc.coordinates[1]],
    }))
    
    const {id, email} = req.user

    try {
        const uploadAwsImage = await uploadToS3(req.file, id)

        body.authorisedDealer = uploadAwsImage
        
        const serviceProvider = await ServiceProvider.create({...body, "userId": id})

        await User.findOneAndUpdate(
            {"_id": id, email}, 
            {$set: {"role": body.role}, 
            $push: {"serviceProvider": serviceProvider._id}
        })

        await Category.findOneAndUpdate({"_id": body.categoryId}, {$push: {"serviceProviderIds": serviceProvider._id}})

        const existingCategory = await Category.findOne({"_id": body.categoryId})

        // Check for existing serviceIds in the Category
        const existingServiceIds = existingCategory.serviceIds.map(String);
        const newServiceIds = body.serviceIds.map(String)

        // Find the IDs that are not already present in the existing serviceIds array
        const uniqueNewServiceIds = newServiceIds.filter((id) => !existingServiceIds.includes(id))
        
        // If there are unique IDs, update the Category
        if (uniqueNewServiceIds.length > 0) {
            await Category.findOneAndUpdate(
                { "_id": body.categoryId },
                {
                    $addToSet: {
                        "serviceIds": { $each: uniqueNewServiceIds },
                        "serviceProviderIds": serviceProvider._id
                    }
                }
            )
        } else {
            await Category.findOneAndUpdate(
                { "_id": body.categoryId },
                { $addToSet: { "serviceProviderIds": serviceProvider._id } }
            )
        }

        res.status(201).json(serviceProvider)
    } catch(err){
        res.status(500).json(err)
    }
}

// list for users
serviceProviderCltrs.listForUser = async (req, res)=>{
    const { latitude, longitude } = req.query
    const { id } = req.params
    
    const parsedLatitude = parseFloat(latitude)
    const parsedLongitude = parseFloat(longitude)

    const page = req.query.page || 1
    const limit = 4
    const skip = (page - 1) * limit

    if (isNaN(parsedLatitude) || isNaN(parsedLongitude)) {
        return res.status(400).json({ error: 'Invalid latitude or longitude values' });
    }

    try {
        const services = await ServiceProvider.find({
            'locations.coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parsedLongitude, parsedLatitude],
                    },
                    $maxDistance: 10000,
                },
            },
            "isApproved": true,
            "categoryId": id,
            "userId": { $ne: req.user.id }
        }).skip(skip).limit(limit)
        .populate({
            path: 'serviceIds',
            select: 'serviceName'
        }).populate({
            path: 'categoryId',
            select: 'title'
        }).populate({
            path: 'userId',
            select: 'profilePicture.url'
        })
        console.log(services)
        res.status(200).json(services)
    } catch(err){
        res.status(500).json(err)
    }
}

// admin approval update
serviceProviderCltrs.updateService = async (req, res)=>{
    const {id, response} = req.params
    const io = await getIOInstance()
    try {
        if(response === "approve"){
            const result = await ServiceProvider.findOneAndUpdate(
                {"_id": id}, {"isApproved": true}, {new: true}
            )
            io.to(`${result.userId}`).emit("approved", `Admin has been approved ${result.serviceProviderName}`)
            res.status(200).json({"id":result._id})
        }else{
            const result = await ServiceProvider.findOneAndUpdate(
                {"_id": id}, {"isRejected": true}, {new: true}
            )
            io.to(`${result.userId}`).emit("rejected", `Admin has been rejected ${result.serviceProviderName}`)
            res.status(200).json({"id":result._id})
        }
    }catch(err){
        res.status(500).json(err)
    }
}



module.exports = serviceProviderCltrs