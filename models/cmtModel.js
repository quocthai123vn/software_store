const mongoose = require('mongoose')
const Schema = mongoose.Schema
const CmtSchema=new Schema({
    uid:{
        type:String,
        unique: true
    },
    cmt:String,
    by:String,
    date:Date,
    postId:String
})

module.exports=mongoose.model('Cmt',CmtSchema)