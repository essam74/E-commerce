import { asyncHandler } from "../../../utils/errorHandling.js"
import productModel from '../../../../DB/model/Product.model.js'
import cartModel from "../../../../DB/model/Cart.model.js"

 

export const cart = asyncHandler(async (req, res , next)=>{
    const cart = await cartModel.find({})
    return res.status(200).json({message: "Done" , cart})
})

// add to cart 


export const addToCart = asyncHandler(async(req,res,next)=>{
    //prepare product 
    const {productId , quantity} = req.body
    const product = await productModel.findById(productId)
    if(!product){
        return next (new Error('in-valid product id' , {cause: 400}))
    }
    if(quantity > product.stock || product.isDeleted){
        await productModel.updateOne({_id: productId } , {$addToSet: {wishUser: req.user._id}})
        return next (new Error('out of stock' , {cause: 400}))
    }

    // check cart exist
    const cart = await cartModel.findOne({ createdBy: req.user._id})
    if(!cart){
        // create cart first time
        const newCart = await cartModel.create({
            createdBy: req.user._id,
            products: [{productId , quantity}]
        })
        return res.status(201).json({message: 'cart created', cart: newCart})
    }


    // update cart

    let matchProduct = false
    
    for (const product of cart.products){
        if(product.productId.toString() == productId){
            product.quantity = quantity
            matchProduct = true;
            break;
        }
    }

    //  push to cart
    if(!matchProduct){
        cart.products.push({productId , quantity})
    }
    await cart.save()
    return res.status(200).json({message: 'Done', cart})
})


 
// delete From Cart

export async function deleteElementFromCart(productIds , createdBy){
    const cart = await cartModel.updateOne({createdBy},
         {$pull: {products: {productId: {$in: productIds}}}})
         return cart
}

export const deleteFromCart = asyncHandler(async(req, res, next)=>{
    const cart = await deleteElementFromCart(req.user._id , req.user._id)
    return res.status(200).json({message:'done', cart})
})

export async function clearAllCart(createdBy){
   const cart = await cartModel.updateOne({createdBy} , {products:[]})
    return cart
}
 
export const clearCart = asyncHandler(async(req, res, next)=>{
    const cart = await clearAllCart(req.user._id)
    return res.status(200).json({message:'done', cart})
})


