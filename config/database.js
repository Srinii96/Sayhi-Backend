const mongoose = require("mongoose")

const configureDB = async ()=>{
    const url = process.env.DB_URL || 'mongodb://127.0.0.1:27017'
    const name = process.env.DB_NAME || "service-at-your-home"
    try{
        await mongoose.connect(`${url}/${name}`)
        console.log("Connected to DB", name)
    } catch(e){
        console.log('Error connecting to db', e.message)
    }
}

module.exports = configureDB