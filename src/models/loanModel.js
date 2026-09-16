import mongoose from "mongoose";


const loanTransactionSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        },

    loanType: {
        type: String,
        enum: ["loan_given", "loan_received"],
        required: true,
        },

    amount: {
        type: Number,
        required: true,
        min: 0,
        },

    paymentType: {
        type: String,
        enum: ["cash", "bank transfer"],
        required: true,
        }
    },
    {
        _id: false,
    }
);

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
    transactions: {
        type: [loanTransactionSchema],
        default: [],
    }
    
},{timestamps : true})

export const Loan = mongoose.model("Loan",loanschema);
