import mongoose, { trusted } from "mongoose";

const saleschema = new mongoose.Schema({
    admin :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Admin"
    },
    receiptNo:{
        type : String,
        required : true,
        trim : true,
        unique : true
    },
    date : {
        type : Date,
        required : true
    },
    cngVolume : {
        type : Number,
        required : true,
        default : 0
    },
    amount : {
        type : Number,
        required : true,
        default :0
    },
    paymentMethod :{
        type : String,
        enum:["cash" , "bank transfer"],
        required : true
    },
    notes:{
        type : String,
        default : "",
        trim : true
    },
    status : {
        type : String,
        enum :["completed", "cancelled"],
        default : "completed"
    }
},{timestamps : true})

export const Sale = mongoose.model("Sale",saleschema);
