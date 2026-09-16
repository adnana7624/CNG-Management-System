import mongoose from "mongoose";

const ownerExpenseSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        paymentMode: {
            type: String,
            enum: ["Cash Account", "Bank Account"],
            required: true,
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Owner",
            required: true,
        },

        status: {
            type: String,
            enum: ["Paid", "Pending"],
            default: "Paid",
        },

        remarks: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

export const OwnerExpense = mongoose.model(
    "OwnerExpense",
    ownerExpenseSchema
);