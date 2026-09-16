import mongoose from "mongoose";

const expenseCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

export const ExpenseCategory = mongoose.model(
    "ExpenseCategory",
    expenseCategorySchema
);