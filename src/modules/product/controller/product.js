import slugify from "slugify";
import subcategoryModel from '../../../../DB/model/Subcategory.model.js'
import brandModel from '../../../../DB/model/Brand.model.js'
import cloudinary from '../../../utils/cloudinary.js'
import {asyncHandler} from '../../../utils/errorHandling.js'
import {nanoid} from 'nanoid';
import productModel from "../../../../DB/model/Product.model.js";
import ApiFeatures from "../../../utils/apiFeatures.js";
import userModel from "../../../../DB/model/User.model.js";

// show product

export const products = asyncHandler(async(req, res, next) => {

    const apiFeatures = new ApiFeatures(productModel.find().populate([{path: "review"}]) ,req.query).paginate().filter().sort().search().select()
    const productList = await apiFeatures.mongooseQuery

    // to show review
    for(let i =0; i < productList.length; i++){
        let calcRating =0;
        for(let x=0; x< productList[i].review.length; x++){
            calcRating += productList[i].review[x].rating
        }
        const convObject = productList[i].toObject()
        convObject.rating = calcRating / productList[i].review.length
        productList[i] = convObject
    } 

    return res.status(200).json({message: "done", productList})

  })

// create product

export const createProduct = asyncHandler( async(req, res, next) => {
    const {name, categoryId, subcategoryId, brandId, price, discount} = req.body
   
    if(!await subcategoryModel.findOne({_id: subcategoryId , categoryId})){
        return next(new Error('In-valid subcategory id' , {cause:400}));
    } 
    if(!await brandModel.findOne({_id: brandId})){
        return next(new Error('In-valid brand id' , {cause:400}));
    }

    req.body.slug = slugify(name, {
            replacement: '_',
            trim: true,
            lower: true
        })
    req.body.finalPrice = Number.parseFloat(price - (price * ((discount||0) / 100))).toFixed(2);
    
    req.body.customId = nanoid()
    const {secure_url , public_id} = await cloudinary.uploader.upload(req.files.mainImage[0].path, {folder:`${process.env.APP_NAME}/products/${req.body.customId}`})
    req.body.mainImage = {secure_url , public_id}

    if(req.files?.subImages?.length){
        req.body.subImages = []
        for(const image of req.files.subImages){
            const {secure_url, public_id} = await cloudinary.uploader.upload(image.path, {folder:`${process.env.APP_NAME}/products/${req.body.customId}/subImages`})
            req.body.subImages.push({secure_url, public_id})
        }
    }

    req.body.createdBy = req.user._id

    const product = await productModel.create(req.body)

    return res.status(201).json({success: true, product })

})

// update product

export const updateProduct = asyncHandler( async(req, res, next) => {
    const {name, categoryId, subcategoryId, brandId, price, discount} = req.body
    const {productId}= req.params;
    const product = await productModel.findById(productId)

    if(!product){
        return next(new Error('product not found' , {cause:400}));
    }

    if(categoryId && subcategoryId){
        if(!await subcategoryModel.findOne({_id: subcategoryId , categoryId})){
            return next(new Error('Subcategory not found' , {cause:400}));
        }
    }
    
    if(brandId){
        if(!await brandModel.findOne({_id: brandId})){
            return next(new Error('brand not found' , {cause:400}));
        }
    }

    if(name){
        req.body.slug = slugify(name,{
            lower: true
        });
    }

    if(price && discount){
        req.body.finalPrice = Number.parseFloat(price - (price * ((discount) / 100))).toFixed(2);
    }else if(price){
        req.body.finalPrice = Number.parseFloat(price - (price * ((product.discount||0) / 100))).toFixed(2);
    }else if(discount){
        req.body.finalPrice = Number.parseFloat(product.price - (product.price * ((discount) / 100))).toFixed(2);
    }

    if(req.files?.mainImage?.length){
    const {secure_url , public_id} = await cloudinary.uploader.upload(req.files.mainImage[0].path, {folder:`${process.env.APP_NAME}/products/${product.customId}`})
    await cloudinary.uploader.destroy(product.mainImage.public_id)
    req.body.mainImage = {secure_url , public_id}
    }
    if(req.files?.subImages?.length){
        req.body.subImages = []
        for(const image of req.files.subImages){
            const {secure_url, public_id} = await cloudinary.uploader.upload(image.path, {folder:`${process.env.APP_NAME}/products/${product.customId}/subImages`})
            req.body.subImages.push({secure_url, public_id})
        }
    }

    req.body.updatedBy = req.user._id
    await productModel.updateOne({_id: productId} , req.body)
    return res.status(200).json({success: true, product })

})


// add to wishlist
export const wishlist = asyncHandler(async(req, res, next)=>{
    const {productId} = req.params
    if(!await productModel.findOne({_id: productId, isDeleted: false})){
        return next(new Error('Product not found' , {cause:404}))
    }
    await userModel.updateOne({_id: req.user._id} , {$addToSet: {wishlist: productId}})
    return res.status(200).json({message: "Done"})
})


// delete from wishlist
export const deleteFromWishlist = asyncHandler(async(req, res, next)=>{
    const {productId} = req.params
    await userModel.updateOne({_id: req.user._id} , {$pull: {wishlist: productId}})
    return res.status(200).json({message: "Done"})
})
