import morgan from 'morgan'
import connectDB from '../DB/connection.js'
import authRouter from './modules/auth/auth.router.js'
import branRouter from './modules/brand/brand.router.js'
import cartRouter from './modules/cart/cart.router.js'
import categoryRouter from './modules/category/category.router.js'
import couponRouter from './modules/coupon/coupon.router.js'
import orderRouter from './modules/order/order.router.js'
import productRouter from './modules/product/product.router.js'
import reviewsRouter from './modules/reviews/reviews.router.js'
import subcategoryRouter from './modules/subcategory/subcategory.router.js'
import userRouter from './modules/user/user.router.js'
import { globalErrorHandling } from './utils/errorHandling.js'
import cors from 'cors'



const initApp = (app, express) => {

    // to select frontend developer who can access to backend 
    // allow access from anywhere
     app.use(cors()) 
    // allow access from frontend developers selected
    // var whiteList = ['http://127.0.0.1:5500' , 'http://127.0.0.1:5000']
    // app.use(async(req,res,next)=>{
    //     if (!whiteList.includes(req.header('origin'))){
    //         return next(new Error('Not allowed by CORS'))
    //     }
    //     await res.header('Access-Control-Allow-Origin' , req.header('origin'))
    //     await res.header('Access-Control-Allow-Headers' , '*')
    //     await res.header('Access-Control-Allow-Private-Network' , '*')
    //     await res.header('Access-Control-Allow-Methods' , '*')
    //     next()
    // })



    //convert Buffer Data
    if(process.env.MOOD == "DEV"){
        app.use(morgan('dev'))
    }else{
        app.use(morgan('common'))
    }
    app.use(express.json({}))
    //Setup API Routing 
    app.use(`/auth`, authRouter)
    app.use(`/user`, userRouter)
    app.use(`/product`, productRouter)
    app.use(`/category`, categoryRouter)
    app.use(`/subCategory`, subcategoryRouter)
    app.use(`/reviews`, reviewsRouter)
    app.use(`/coupon`, couponRouter)
    app.use(`/cart`, cartRouter)
    app.use(`/order`, orderRouter)
    app.use(`/brand`, branRouter)

    app.all('*', (req, res, next) => {
        res.send("In-valid Routing Plz check url  or  method")
    })

    app.use(globalErrorHandling)
    connectDB()

}



export default initApp