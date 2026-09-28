import mongoose from "mongoose";

const expenseCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            
        },
          admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
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