import categoryModel from "../../../../DB/model/Category.model.js";
import cloudinary from '../../../utils/cloudinary.js'
import slugify from 'slugify'
import { asyncHandler } from "../../../utils/errorHandling.js";


                      // get category

export const categoryList = asyncHandler(async (req, res , next)=>{
    const category = await categoryModel.find({isDeleted: false}).populate([{ path: 'subcategory'}])
    return res.status(200).json({message: "Done" , category})
}) 


                    // create category

export const createCategory = asyncHandler(async (req, res , next)=>{
    const {name} = req.body
    const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path, {folder: `${process.env.APP_NAME}/Category`})
 
    const category = await categoryModel.create({
        name,
        slug: slugify(name, '_'),
        image: {secure_url , public_id}
    })
 
    if(!category){
        await cloudinary.uploader.destroy(public_id)
        return next(new Error("fail to create your category" , {cause:400}))

    }

    return res.status(201).json({message: "Done" , category})
})


                     // update category

export const updateCategory = asyncHandler(async (req, res , next)=>{
    const category = await categoryModel.findById(req.params.categoryId)
    if(!category){
        return next(new Error("In-valid category Id" , {cause:400}))
    }

    if(req.body.name){
        category.name = req.body.name
        category.slug = slugify(req.body.name , "_")
    }

    if(req.file){
        const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path, {folder: `${process.env.APP_NAME}/Category`})
        await cloudinary.uploader.destroy(category.image.public_id)
        category.image = {secure_url , public_id}
    }
    await category.save()
    return res.status(200).json({message: "Done" , category})
})