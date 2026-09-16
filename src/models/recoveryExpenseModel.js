
import mongoose from "mongoose";

const recoveryExpenseSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExpenseCategory",
            required: true,
        },

        recoveryAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        remarks: {
            type: String,
            trim: true,
            default: "",
        },

        paymentMode: {
            type: String,
            enum: ["Cash Account", "Bank Account"],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const RecoveryExpense = mongoose.model(
    "RecoveryExpense",
    recoveryExpenseSchema
);