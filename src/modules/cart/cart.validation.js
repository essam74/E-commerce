
import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'


export const addToCart = joi.object({
    productId: generalFields.id,
    quantity: joi.number().integer().positive().min(1).required()
}).required()

 
export const deleteFromCart = joi.object({
    productId: joi.array().items(generalFields.id).required() ,
}).required()

