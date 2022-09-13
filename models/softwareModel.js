const mongoose = require('mongoose')
const Schema = mongoose.Schema
const SoftwareSchema=new Schema({
    uid:{
        type:String,
        unique: true
    },
    quantity:{
        type:Number,
        default:0
    },
    softwareName:String,
    price:Number,
    description:String,
    softwareImage:String,
    supplierId:String
})
module.exports=mongoose.model('Software',SoftwareSchema)