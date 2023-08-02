import mongoose from "mongoose"
import  { model , Schema , Types } from "mongoose"



const brandSchema = new Schema({
    name: {type:String , required: true , unique:true, trim:true, lower:true, upper:true},
    slug: {type:String , required: true},
    image: {type:Object},
    createdBy: {type:Types.ObjectId , ref:'User' , required: false},
    isDeleted: {type:Boolean , default: false},
    
}, { 
    timestamps:true
})

const brandModel = mongoose.models.brand || model('brand' , brandSchema)
export default brandModel
