import mongoose from "mongoose"
import  { model , Schema , Types } from "mongoose"



const subcategorySchema = new Schema({
    name: {type:String , required: true},
    slug: {type:String , required: true},
    image: {type:Object , required: true},
    categoryId: {type:Types.ObjectId , ref:'Category' , required: true},
    createdBy: {type:Types.ObjectId , ref:'User' , required: false},
    isDeleted: {type:Boolean , default: false},
    
}, {
    timestamps:true
})

const subcategoryModel = mongoose.models.Subcategory || model('subcategory' , subcategorySchema)
export default subcategoryModel