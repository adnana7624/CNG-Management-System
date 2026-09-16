import mongoose from "mongoose";

const cashBankSchema = new mongoose.Schema({
    admin : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Admin",
        required : true
    },
    transferType : {
        type : String,
        enum : ["cash_to_bank" , "bank_to_cash"],
        required : true
    },
    amount : {
        type : Number,
        required : true,
        min : 0
    },
    date : {
        type : Date,
        required : true
    }
} , {timestamps : true});

export const CashBank = mongoose.model("CashBank",cashBankSchema);