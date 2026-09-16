// // import { ExpenseCategory } from "../models/expenseModel.js";

// // // Create Expense Category
// // const createExpenseCategory = async (req, res) => {
// //     try {
// //         const { name, description, status } = req.body;

// //         // Validate required fields
// //         if (!name || !description) {
// //             return res.status(400).json({
// //                 success: false,
// //                 message: "Name and description are required",
// //             });
// //         }

// //         // Create Expense Category
// //         const expenseCategory = await ExpenseCategory.create({
// //             name,
// //             description,
// //             status,
// //             admin: req.user.id,
// //         });

// //         return res.status(201).json({
// //             success: true,
// //             message: "Expense category created successfully",
// //             data: expenseCategory,
// //         });

// //     } catch (error) {
// //         console.error("Create Expense Category Error:", error);

// //         return res.status(500).json({
// //             success: false,
// //             message: error.message,
// //         });
// //     }
// // };


// // // Get Expense Categories
// // const getExpenseCategories = async (req, res) => {
// //     try {
// //         const expenseCategories = await ExpenseCategory.find({
// //             admin: req.user.id,
// //             status: "active",
// //         }).sort({ createdAt: -1 });

// //         return res.status(200).json({
// //             success: true,
// //             message: "Expense categories fetched successfully",
// //             data: expenseCategories,
// //         });

// //     } catch (error) {
// //         console.error("Get Expense Categories Error:", error);

// //         return res.status(500).json({
// //             success: false,
// //             message: error.message,
// //         });
// //     }
// // };


// // export {
// //     createExpenseCategory,
// //     getExpenseCategories
// // };




// import { Expense } from "../models/expenseModel.js";

// export const createExpense = async (req, res) => {
//     try {
//         const {
//             date,
//             amount,
//             category,
//             paymentMode,
//             status,
//             remarks,
//         } = req.body;

//         const expense = await Expense.create({
//             date,
//             amount,
//             category,
//             paymentMode,
//             status,
//             remarks,
//         });

//         res.status(201).json({
//             success: true,
//             message: "Expense created successfully",
//             expense,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// import { Expense } from "../models/expenseModel.js";

// // Create Expense
// export const createExpense = async (req, res) => {
//     try {
//         const {
//             date,
//             amount,
//             category,
//             paymentMode,
//             status,
//             remarks,
//         } = req.body;

// const expense = await Expense.create({
//     date,
//     amount,
//     category,
//     paymentMode,
//     status,
//     remarks,
// });

//         res.status(201).json({
//             success: true,
//             message: "Expense created successfully",
//             expense,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// // Get All Expenses
// export const getExpenses = async (req, res) => {
//     try {
//         const expenses = await Expense.find()
//             .populate("category")
//             .sort({ createdAt: -1 });

//         res.status(200).json({
//             success: true,
//             count: expenses.length,
//             expenses,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };



import mongoose from "mongoose";
import { Expense } from "../models/expenseModel.js";

// Create Expense
export const createExpense = async (req, res) => {
    try {
        const {
            date,
            amount,
            category,
            paymentMode,
            status,
            remarks,
        } = req.body;

        // Required fields validation
        if (!date || amount === undefined || !category || !paymentMode) {
            return res.status(400).json({
                success: false,
                message: "Date, amount, category and paymentMode are required",
            });
        }

        // Amount validation
        if (Number(amount) < 0) {
            return res.status(400).json({
                success: false,
                message: "Amount cannot be negative",
            });
        }

        // Category ID validation
        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        const expense = await Expense.create({
            date,
            amount,
            category,
            paymentMode,
            status,
            remarks,
        });

        res.status(201).json({
            success: true,
            message: "Expense created successfully",
            expense,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get All Expenses
export const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find()
            .populate("category")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: expenses.length,
            expenses,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update Expense
export const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate Expense ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid expense ID",
            });
        }

        const {
            date,
            amount,
            category,
            paymentMode,
            status,
            remarks,
        } = req.body;

        // Required fields validation
        if (!date || amount === undefined || !category || !paymentMode) {
            return res.status(400).json({
                success: false,
                message: "Date, amount, category and paymentMode are required",
            });
        }

        // Amount validation
        if (Number(amount) < 0) {
            return res.status(400).json({
                success: false,
                message: "Amount cannot be negative",
            });
        }

        // Validate Category ID
        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        const expense = await Expense.findByIdAndUpdate(
            id,
            {
                date,
                amount,
                category,
                paymentMode,
                status,
                remarks,
            },
            {
                new: true,
                runValidators: true,
            }
        ).populate("category");

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Expense updated successfully",
            expense,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete Expense
export const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate Expense ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid expense ID",
            });
        }

        const expense = await Expense.findByIdAndDelete(id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Expense deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};










