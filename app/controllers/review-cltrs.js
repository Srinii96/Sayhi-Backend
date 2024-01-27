const Review = require("../models/review-rating-model")
const ServiceProvider = require("../models/service-provider-model")
const { validationResult } = require("express-validator")
const _ = require("lodash")

const reviewCltrs = {}

// create
reviewCltrs.create = async (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
      return res.status(400).json({"error": errors.array()})
    }

    const body = _.pick(req.body, ["comment", "rating", "orderId", "serviceProviderId"])
    const { id } = req.user

    try{
        const review = new Review(body)
        review.userId = id

        const { serviceProviderId, _id } = review
        await ServiceProvider.findOneAndUpdate(
            {"_id": serviceProviderId}, {"reviewId": _id}, {new: true}
        )
        
        await review.save()
        res.status(201).json({msg: "success"})
    }catch(err){
        res.status(500).json(err)
    }
}

module.exports = reviewCltrs