import mongoose from "mongoose";

const dieselExpenseSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },

        dieselQuantity: {
            type: Number,
            required: true,
            min: 0,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
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

export const DieselExpense = mongoose.model(
    "DieselExpense",
    dieselExpenseSchema
);