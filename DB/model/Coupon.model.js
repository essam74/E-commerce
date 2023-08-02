import mongoose from "mongoose"
import  { model , Schema , Types } from "mongoose"



const couponSchema = new Schema({
    name: {type:String , required: true , unique:true},
    image: {type:Object},
    amount: {type:Number, default:1 , required:true},
    createdBy: {type:Types.ObjectId , ref:'User' , required: true},
    usedBy: [{type:Types.ObjectId , ref:'User'}],
    updatedBy: {type:Types.ObjectId , ref:'User'},
    expire: {type:Date, required: true}, 
    isDeleted: {type:Boolean , default: false},
    
}, {
    timestamps:true
})

const couponModel = mongoose.models.Coupon || model('Coupon' , couponSchema)
export default couponModel 