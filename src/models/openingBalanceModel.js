import mongoose from "mongoose";

const openingBalanceSchema = new mongoose.Schema({
    admin : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Admin",
        required : true
    },
    balanceType : {
        type : String,
        enum : ["cash_in_hand","cash_in_bank","loan_to_others","loan_given"],
        required : true
    },
    targetMonth : {
        type : Date,
        required : true
    },
    date : {
        type : Date,
        required : true
    },
    amount : {
        type : Number,
        required : true,
        min : 0
    }
},{timestamps : true});

openingBalanceSchema.index(
    {
        admin : 1,
        targetMonth : 1,
        balanceType : 1
    },
    {
        unique : true
    }
)

export const OpeningBalance = mongoose.model("OpeningBalance",openingBalanceSchema);