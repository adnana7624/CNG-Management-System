import mongoose from "mongoose";

const loanOpeningBalanceSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
        },

        
        targetMonth: {
            type: Date,
            required: true,
        },

        date: {
            type: Date,
            required: true,
        },

        
        loanType: {
            type: String,
            enum: ["loan_given", "loan_received"],
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        
        remainingBalance: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: ["active", "paid"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

export const LoanOpeningBalance = mongoose.model(
    "LoanOpeningBalance",
    loanOpeningBalanceSchema
);