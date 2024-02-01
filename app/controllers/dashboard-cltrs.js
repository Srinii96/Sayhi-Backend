const User = require("../models/user-model")
const Booking = require("../models/booking-model")
const Payment = require("../models/payment-model")

const dashboardCltrs = {}

dashboardCltrs.users = async (req, res)=>{
    const users = await User.aggregate([
        {
            $group: {'_id': '$role', count: {    
                $sum: 1
            }}, 
        },
    ])

    try{
        res.status(200).json(users)
    }catch(err){
        res.status(500).json(err)
    }
}

dashboardCltrs.bookings = async (req, res)=>{
    const bookings = await Booking.aggregate([
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "bookingId",
          as: "payment",
        },
      },
      { $unwind: "$payment" },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category.title",
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$payment.amount" },
        },
      },
      {
        $group: {
          _id: null,
          categories: {
            $push: {
              category: "$_id",
              totalBookings: "$totalBookings",
              totalRevenue: "$totalRevenue",
            },
          },
          totalBookingsAll: { $sum: "$totalBookings" },
          totalRevenueAll: { $sum: "$totalRevenue" },
        },
      },
      {
        $project: {
          _id: 0,
          categories: 1,
          totalBookingsAll: 1,
          totalRevenueAll: 1,
          adminProfit: { $multiply: ["$totalRevenueAll", 0.1] },
        },
      },
    ])
      
      
      
    try{
        res.status(200).json(bookings)
    }catch(err){
        res.status(500).json(err)
    }
}

module.exports = dashboardCltrs