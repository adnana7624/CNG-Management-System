import mongoose from "mongoose";

const userchema = new mongoose.Schema({
    name:{
        type : String,
        required : true,
    },
    email:{
        type : String,
        rerquired : true,
        unique : true,
        trim : true,
        lowercase:true
    },
    password : {
        type : String,
        required : true
    },
    role:{
        type : String,
        enum :["SuperAdmin","Admin"],
        default : ""
    }
},{timestamps:true})

export const User = mongoose.model("User",userchema);