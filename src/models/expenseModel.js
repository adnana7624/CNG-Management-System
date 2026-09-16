// // // 
// // import mongoose from "mongoose";

// // const expenseCategorySchema = new mongoose.Schema(
// //     {
// //         name: {
// //             type: String,
// //             required: true,
// //             trim: true,
// //         },

// //         description: {
// //             type: String,
// //             required: true,
// //             trim: true,
// //         },

// //         amount: {
// //             type: Number,
// //             required: true,
// //             min: 0,
// //         },

// //         paymentMode: {
// //             type: String,
// //             enum: ["Cash Account", "Bank Account"],
// //             required: true,
// //         },

// //         status: {
// //             type: String,
// //             enum: ["Paid", "Unpaid"],
// //             default: "Paid",
// //         },

// //         admin: {
// //             type: mongoose.Schema.Types.ObjectId,
// //             ref: "Admin",
// //             required: true,
// //         },
// //     },
// //     {
// //         timestamps: true,
// //     }
// // );

// // export const ExpenseCategory = mongoose.model(
// //     "ExpenseCategory",
// //     expenseCategorySchema
// // );

// import mongoose from "mongoose";

// const expenseSchema = new mongoose.Schema(
//     {
//         date: {
//             type: Date,
//             required: true,
//             default: Date.now,
//         },

//         amount: {
//             type: Number,
//             required: true,
//             min: 0,
//         },

//         category: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "ExpenseCategory",
//             required: true,
//         },

//         paymentMode: {
//             type: String,
//             enum: ["Cash Account", "Bank Account"],
//             required: true,
//         },

//         status: {
//             type: String,
//             enum: ["Paid", "Pending"],
//             default: "Paid",
//         },

//         remarks: {
//             type: String,
//             trim: true,
//             default: "",
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



import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
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

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExpenseCategory",
            required: true,
        },

        paymentMode: {
            type: String,
            enum: ["Cash Account", "Bank Account"],
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

export const Expense = mongoose.model("Expense", expenseSchema);