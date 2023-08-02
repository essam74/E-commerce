import subcategoryModel from "../../../../DB/model/Subcategory.model.js";
import cloudinary from '../../../utils/cloudinary.js'
import slugify from 'slugify'
import { asyncHandler } from "../../../utils/errorHandling.js";
import categoryModel from "../../../../DB/model/Category.model.js";
import { nanoid } from "nanoid";


                      // get subcategory

export const subcategoryList = asyncHandler(async (req, res , next)=>{
    const subcategory = await subcategoryModel.find({isDeleted: false}).populate([{ path: 'categoryId'}])
    return res.status(200).json({message: "Done" , subcategory})
}) 

 
                    // create subcategory

export const createSubcategory = asyncHandler(async (req, res , next)=>{

    const {categoryId} = req.params;
    if(!await categoryModel.findById(categoryId)){
        return next(new Error("In-valid category Id" , {cause:400}))
    }

    const {name} = req.body
    if(await subcategoryModel.findOne({name: name.toLowerCase()})){
        return next(new Error("Duplicated subcategory name", {cause:409}))
    }
    const customId = nanoid()
    const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path, {folder: `${process.env.APP_NAME}/category/${categoryId}`})

    const subcategory = await subcategoryModel.create({
        name,
        slug: slugify(name, {
            replacement: '_',
            trim: true,
            lower: true
        }),
        image: {secure_url , public_id},
        customId,
        categoryId,
        // createdBy: req.use._id
    })

     if(!subcategory){
        await cloudinary.uploader.destroy(public_id)
        return next(new Error("fail to create your subcategory" , {cause:400}))

    }

    return res.status(201).json({message: "Done" , subcategory})
})


                     // update subcategory

export const updateSubcategory = asyncHandler(async (req, res , next)=>{

    const {categoryId , subcategoryId} = req.params
    const subcategory = await subcategoryModel.findOne({_id:subcategoryId , categoryId})
    if(!subcategory){
        return next(new Error("In-valid subcategory Id" , {cause:400}))
    }

    if(req.body.name){
        req.body.name = req.body.name.toLowerCase();
        if(req.body.name == subcategory.name){
            return next(new Error("old name equal new name " , {cause:409}))
        }
        if(await subcategoryModel.findOne({name: req.body.name})){
            return next(new Error("Duplicated subcategory name " , {cause:409}))
        }
        subcategory.name = req.body.name
        subcategory.slug = slugify(req.body.name , "-")
    }

    if(req.file){
        const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path, 
            {folder: `${process.env.APP_NAME}/Category/${categoryId}`})
        await cloudinary.uploader.destroy(subcategory.image.public_id)
        subcategory.image = {secure_url , public_id}
    }
    await subcategory.save()
    return res.status(200).json({message: "Done" , subcategory})
})