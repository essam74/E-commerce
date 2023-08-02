import mongoose, { Schema, Types, model } from "mongoose";


const userSchema = new Schema({

    firstName:String,
    lastName:String,

    userName: {
        type: String,
        required: [true, 'userName is required'],
        min: [2, 'minimum length 2 char'],
        max: [20, 'max length 2 char']

    },
    email: {
        type: String,
        unique: [true, 'email must be unique value'],
        required: [true, 'userName is required'],
    },
    password: {
        type: String,
        required: [true, 'password is required'],
    },
    phone: {
        type: String,
    },
    address:String,
    role: {
        type: String,
        default: 'User',
        enum: ['User', 'Admin']
    },
     gender: {
        type: String,
        default: 'male',
        enum: ['male', 'female']
    },

    active: {
        type: Boolean,
        default: false,
    },
    confirmEmail: {
        type: Boolean,
        default: false,
    },
    code:{
        type: Number,
        default: null
    },
    
    changePasswordTime: Date
    ,
    status: {
        type: String,
        default: "offline",
        enum:['offline','online','blocked'] 
    },
    image: Object,
    DOB: String,
    wishList: [{type:Types.ObjectId , ref: 'Product'}]
}, {
    timestamps: true
})


const userModel = mongoose.models.User || model('User', userSchema)
export default userModel