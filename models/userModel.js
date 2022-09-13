const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema=new Schema({
    uid:{
        type:String,
        unique: true
    },
    email:{
        type:String,
        unique: true,
    },
    ho:String,
    ten:String,
    avatar:String,
    ngaysinh:String,
    bankId:String,
    bankName:String,
    password:String,
    role:String,
    money:{
        type:Number,
        default:0
    },
    mySoftware:[
        {
            softwareName:String,
            buyDate:Date,
            key:String
        }
    ]
})

module.exports=mongoose.model('User',UserSchema)