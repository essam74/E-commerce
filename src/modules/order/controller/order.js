import productModel from '../../../../DB/model/Product.model.js'
import couponModel from '../../../../DB/model/Coupon.model.js'
import orderModel from '../../../../DB/model/Order.model.js'
import { clearAllCart, deleteElementFromCart } from '../../cart/controller/cart.js'
import cartModel from '../../../../DB/model/Cart.model.js'
import { asyncHandler } from '../../../utils/errorHandling.js'

// create order
export const createOrder = async (req, res, next)=>{

    const {products , address , phone ,note, paymentType, couponName} = req.body
   
    if (!req.body.products){
        const cart = await cartModel.findOne({createdBy: req.user._id})
        if(!cart.products?.length){
        return next(new Error(`empty cart` , {cause: 404}))
    }
    req.body.isCart = true
    req.body.products = cart.products
    }
   
    if(couponName){
        const coupon = await couponModel.findOne({name: couponName.toLowerCase() , usedBy:{$nin: req.user._id} , isDeleted: false})
        if(!coupon || (parseInt(Date.now() / 1000) > parseInt((coupon?.expire?.getTime() / 1000)))){
            return next(new Error('Coupon not found or expired',{cause:400}))
        } 
        req.body.coupon = coupon
    }

    let subtotal = 0; 
    let finalProductsList = [];
    let productsIds = [];

    for (let product of req.body.products) {

        const checkProduct = await productModel.findOne({
            _id: product.productId,
            stock: {$gte: product.quantity},
            isDeleted: false
        }) 
        if(!checkProduct){
            return next(new Error(`fail to add this product ${product.name}` ))
        }

        productsIds.push(product.productId)
        product =  req.body.isCart? product.toObject(): product;
        product.name = checkProduct.name;
        product.unitPrice = checkProduct.finalPrice;
        product.finalPrice = checkProduct.unitPrice * product.quantity
        finalProductsList.push(product)

        subtotal += product.finalPrice
    }
    const order = await orderModel.create({
        createdBy: req.user._id,
        products: finalProductsList,
        couponId: req.body.coupon?._id,
        finalPrice: subtotal - (subtotal * ((req.body.coupon?.amount||0) / 100)),
        address,
        phone,
        note,
        paymentType,
        status: paymentType == 'card'? 'wait to place order' : 'placed'
    })

    //to decrease product from stock
    for (const product of req.body.products){
        await productModel.updateOne({_id: product.productId}, {$inc: {stock: -parseInt(product.quantity)}})
    }

    //to make coupon used
    if(req.body.coupon?._id){
        await couponModel.updateOne({_id: req.body.coupon?._id}, {$addToSet: {usedBy: req.user._id}})
    }

    // to delete product from cart after made order
    if(!req.body.isCart){
        await deleteElementFromCart(productsIds , req.user._id)
    }else{
        await clearAllCart(req.user._id)
    }
    return res.status(201).json({message: 'Product added', order })



} 


// cancel order
export const cancelOrder = asyncHandler(async (req, res, next) => {
    const {orderId} = req.params
    const {reason} = req.body

    const order = await orderModel.findOne({_id: orderId , createdBy: req.user._id})
    if(!order){
        return next (new Error('Order not found' , {cause:400}))
    }
    if((order.status !='placed' && order.paymentType == 'cash') ||
    (order.status != 'waitPayment' && order.paymentType == 'card')){
        return next (new Error(`cannot cancel your order after it been changed to ${order.status}` , {cause:400}))
    }
    await orderModel.updateOne({_id: orderId , createdBy: req.user._id}, {status: 'canceled', updatedBy: req.user._id , reason})
   
       //to restore product to stock again
       for (const product of order.products){
        await productModel.updateOne({_id: product.productId}, {$inc: {stock: parseInt(product.quantity)}})
    }

    //to make coupon unused again
    if(order.couponId){
        await couponModel.updateOne({_id: order.couponId}, {$pull: {usedBy: req.user._id}})
    }

   
   
    return res.status(201).json({message: 'done', order})
})


// the delivered orders to access review and rating
export const deliveredOrder = asyncHandler(async (req, res, next) => {
    const {orderId} = req.params

    const order = await orderModel.findOne({_id: orderId})
    if(!order){
        return next (new Error('in-valid id' , {cause:400}))
    }
    if(["waitPayment","canceled", "rejected", "delivered"].includes(order.status)){ 
        return next (new Error(`cannot update your order after it been changed to ${order.status}` , {cause:400}))
    }
    await orderModel.updateOne({_id: orderId}, {status: 'delivered', updatedBy: req.user._id})
  
    return res.status(201).json({message: 'done', order})
})
