const mongoose = require('mongoose')
const Schema = mongoose.Schema
const HisSchema=new Schema({
    uid:{
        type:String,
        unique: true
    },
    softwareName:String,
    buyDate:Date,
    by:String
})

module.exports=mongoose.model('His',HisSchema)