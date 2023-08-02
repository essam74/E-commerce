import { Router } from "express";
import * as subcategoryController from './controller/subcategory.js'
import {fileUpload, fileValidation} from '../../utils/multer.js'
import {validation} from "../../middleware/validation.js";
import * as  validators from "./subcategory.validation.js";
import { auth, authorized } from "../../middleware/auth.js";
import { endpoint } from "../category/category.endPoint.js";


 

const router = Router({mergeParams:true})

router.get('/', subcategoryController.subcategoryList)


router.post('/', auth,
authorized(endpoint.create),

fileUpload(fileValidation.image).single('image'),
validation(validators.createSubcategory),
subcategoryController.createSubcategory)

router.put('/:subcategoryId', auth,
authorized(endpoint.create),

fileUpload(fileValidation.image).single('image'),
validation(validators.updateSubcategory),
subcategoryController.updateSubcategory)


export default router