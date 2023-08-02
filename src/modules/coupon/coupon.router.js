import { Router } from "express";
import {fileUpload, fileValidation} from '../../utils/multer.js'
import {validation} from "../../middleware/validation.js";
import * as  validators from "./coupon.validation.js";
import * as couponController from './controller/coupon.js'
import  {auth, authorized}  from "../../middleware/auth.js";
import { endpoint } from "../coupon/coupon.endPoint.js";


const router = Router()

router.get('/', couponController.couponList)


router.post('/', auth,authorized(endpoint.create),
fileUpload(fileValidation.image).single('image'),
validation(validators.createCoupon),
couponController.createCoupon)

router.put('/:couponId', 
fileUpload(fileValidation.image).single('image'),
validation(validators.updateCoupon),
couponController.updateCoupon)


export default router