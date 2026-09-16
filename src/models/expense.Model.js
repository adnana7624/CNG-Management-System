// import mongoose from "mongoose";

// const expenseCategorySchema = new mongoose.Schema(
//     {
//         name: {
//             type: String,
//             required: true,
//             trim: true,
//         },

//         description: {
//             type: String,
//             required: true,
//             trim: true,
//         },

//         status: {
//             type: String,
//             enum: ["active", "inactive"],
//             default: "active",
//         },

//         admin: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Admin",
//             required: true,
//         },
//     },
//     {
//         timestamps: true,
//     }
// );

// export const ExpenseCategory = mongoose.model(
//     "ExpenseCategory",
//     expenseCategorySchema
// );

