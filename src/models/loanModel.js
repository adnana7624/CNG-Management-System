import mongoose from "mongoose";

const loanschema = new mongoose.Schema({
    admin : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Admin",
        required : true
    },
    date :{
        type : Date,
        required : true
    },
    loanType : {
        type : String,
        enum : ["loan_given","loan_received"],
        required : true
    },
    name : {
        type : String,
        required : true,
        trim : true
    },
    amount : {
        type : Number,
        required : true,
        min : 0
    },
    status : {
        type : String,
        enum : ["active","paid"],
        default : "active"
    },
    paymentType : {
        type : String,
        enum : ["cash" , "bank transfer"],
        required : true
    },
    remainingBalance : {
        type : Number,
        required : true,
        min : 0
    },
    linkedLoan : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Loan",
        default : null
    },
    remarks : {
        type : String,
        required : true,
        trim : true
    }
},{timestamps : true})

export const Loan = mongoose.model("Loan",loanschema);
