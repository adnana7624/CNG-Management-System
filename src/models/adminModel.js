import mongoose from "mongoose";

const adminschema = new mongoose.Schema({
    pumpName:{
        type :String
    },
    adminName:{
        type : String,
        required : true,
        trim : true
    },
    email:{
        type : String,
        required : true,
        unique : true,
        trim : true
    },
    password: {
        type: String,
        required: true
    },
    pumpAddress :{
        type : String
    },
    status:{
        type :String,
        enum : ["active","inactive"],
        default : "active"
    },
    role : {
        type : String,
        enum : ["admin"],
        default : "admin"
    }
}, {timestamps : true})

export const Admin = mongoose.model("Admin",adminschema)