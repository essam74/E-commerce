import { Router } from "express";
import * as brandController from './controller/brand.js'
import {fileUpload, fileValidation} from '../../utils/multer.js'
import {validation} from "../../middleware/validation.js";
import * as  validators from "./brand.validation.js";
import  {auth, authorized}  from "../../middleware/auth.js";
import { endpoint } from "./brand.endPoint.js";


const router = Router()


router.get('/', brandController.brandList)


router.post('/', auth,authorized(endpoint.create),

fileUpload(fileValidation.image).single('image'),
validation(validators.createBrand),
brandController.createBrand)

router.put('/:brandId', auth,authorized(endpoint.update),
fileUpload(fileValidation.image).single('image'),
validation(validators.updateBrand),
brandController.updateBrand)


export default router