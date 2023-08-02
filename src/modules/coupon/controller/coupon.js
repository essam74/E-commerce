import couponModel from "../../../../DB/model/Coupon.model.js"
import cloudinary from '../../../utils/cloudinary.js'
import slugify from 'slugify'
import { asyncHandler } from "../../../utils/errorHandling.js";


                      // get coupon

export const couponList = asyncHandler(async (req, res , next)=>{
    const coupon = await couponModel.find({isDeleted: false})
    return res.status(200).json({message: "Done" , coupon})
}) 


                    // create coupon

export const createCoupon = asyncHandler(async (req, res , next)=>{
   
     console.log(new Date())

    const name = req.body.name.toLowerCase();
    if(await couponModel.findOne({name})){
        return next(new Error("Duplicated coupon name", {cause:409}))
    }

    if(req.file){
        const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path, {folder: `${process.env.APP_NAME}/coupon`})
        req.body.image = {secure_url , public_id}
    } 
    req.body.createdBy = req.user._id
    const coupon = await couponModel.create(req.body)

    
    return res.status(201).json({message: "Done" , coupon})
})


                     // update coupon 

export const updateCoupon = asyncHandler(async (req, res , next)=>{
    const coupon = await couponModel.findById(req.params.couponId)
    if(!coupon){
        return next(new Error({message:"In-valid coupon Id"} , {cause:400}))
    }

    if(req.body.name){
        req.body.name = req.body.name.toLowerCase()
        if(coupon.name === req.body.name){
            return next(new Error("old name equal new name", {cause:400}))
        }
        if(await couponModel.findOne({name:req.body.name})){
            return next(new Error("Duplicated coupon name", {cause:409}))
        }
    }

    if(req.file){
        const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path, {folder: `${process.env.APP_NAME}/coupon`})
        
        if(coupon.image?.public_id){
            await cloudinary.uploader.destroy(coupon.image?.public_id)
        }
        req.body.image = {secure_url , public_id}    
    }
    req.body.updatedBy = req.user._id
    await couponModel.updateOne({_id: req.params.couponId}, req.body)
    return res.status(200).json({message: "Done" })
})