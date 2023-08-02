import mongoose from "mongoose"
import  { model , Schema , Types } from "mongoose"



const categorySchema = new Schema({
    name: {type:String , required: true},
    slug: {type:String , required: true},
    image: {type:Object , required: true},
    createdBy: {type:Types.ObjectId , ref:'User' , required: false},
    updatedBy: {type:Types.ObjectId, ref:'User'},
    isDeleted: {type:Boolean , default: false},
    
}, {
    toJSON:{ virtuals:true},
    toObject:{ virtuals: true},
    timestamps:true
})

categorySchema.virtual('subcategory', {
    localField:"_id",
    foreignField:'categoryId',
    ref:'subcategory'
})

const categoryModel = mongoose.models.Category || model('category' , categorySchema)
export default categoryModel