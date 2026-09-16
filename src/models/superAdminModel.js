import mongoose from "mongoose";

const superAdminchema = new mongoose.Schema({
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

export const SuperAdmin = mongoose.model("SuperAdmin",superAdminchema);