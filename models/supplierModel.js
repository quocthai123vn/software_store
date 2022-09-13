const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SupplierSchema=new Schema({
    uid:{
        type:String,
        unique: true
    },
    supplierName:String,
    supplierEmail:{
        type:String,
        unique: true
    }
})

module.exports=mongoose.model('Supplier',SupplierSchema)