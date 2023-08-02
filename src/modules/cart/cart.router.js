import {validation} from '../../middleware/validation.js'
import * as validators from './cart.validation.js'
import {auth, authorized} from '../../middleware/auth.js'
import { Router } from "express"
import {endPoint} from './cart.endPoint.js'
import * as cartController from './controller/cart.js'
const router = Router()


router.get('/', cartController.cart)


router.post('/',
auth,
authorized(endPoint.addToCart), 
    validation(validators.addToCart),
    cartController.addToCart )


router.patch('/remove',
auth,
authorized(endPoint.deleteFromCart),
    validation(validators.deleteFromCart),
    cartController.deleteFromCart )


router.patch('/clear',
auth, 
authorized(endPoint.deleteFromCart),
    cartController.clearCart )




export default router