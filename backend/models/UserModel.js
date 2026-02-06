import mongoose from "mongoose";


const USerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    otp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true })


export const userModels = mongoose.model("user", USerSchema)
