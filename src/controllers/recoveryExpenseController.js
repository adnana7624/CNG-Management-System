// import { RecoveryExpense } from "../models/recoveryExpenseModel.js";

// // Create Recovery Expense
// export const createRecoveryExpense = async (req, res) => {
//     try {
//         const {
//             date,
//             category,
//             recoveryAmount,
//             remarks,
//             paymentMode,
//         } = req.body;

//         if (!date || !category || recoveryAmount === undefined || !paymentMode) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Date, category, recovery amount and payment mode are required",
//             });
//         }

//         const recoveryExpense = await RecoveryExpense.create({
//             date,
//             category,
//             recoveryAmount,
//             remarks,
//             paymentMode,
//         });

//         res.status(201).json({
//             success: true,
//             message: "Recovery expense created successfully",
//             recoveryExpense,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// // Get All Recovery Expenses
// export const getRecoveryExpenses = async (req, res) => {
//     try {
//         const recoveryExpenses = await RecoveryExpense.find()
//             .populate("category")
//             .sort({ createdAt: -1 });

//         res.status(200).json({
//             success: true,
//             count: recoveryExpenses.length,
//             recoveryExpenses,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };



import mongoose from "mongoose";
import { RecoveryExpense } from "../models/recoveryExpenseModel.js";

// Create Recovery Expense
export const createRecoveryExpense = async (req, res) => {
    try {
        const {
            date,
            category,
            recoveryAmount,
            remarks,
            paymentMode,
        } = req.body;

        // Required fields validation
        if (
            !date ||
            !category ||
            recoveryAmount === undefined ||
            !paymentMode
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Date, category, recovery amount and payment mode are required",
            });
        }

        // Validate category ID
        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        // Validate amount
        if (Number(recoveryAmount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Recovery amount must be greater than 0",
            });
        }

        const recoveryExpense = await RecoveryExpense.create({
            date,
            category,
            recoveryAmount,
            remarks,
            paymentMode,
        });

        res.status(201).json({
            success: true,
            message: "Recovery expense created successfully",
            recoveryExpense,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Get All Recovery Expenses
export const getRecoveryExpenses = async (req, res) => {
    try {
        const recoveryExpenses = await RecoveryExpense.find()
            .populate("category")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: recoveryExpenses.length,
            recoveryExpenses,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Update Recovery Expense
export const updateRecoveryExpense = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate Recovery Expense ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid recovery expense ID",
            });
        }

        const {
            date,
            category,
            recoveryAmount,
            remarks,
            paymentMode,
        } = req.body;

        // Required fields validation
        if (
            !date ||
            !category ||
            recoveryAmount === undefined ||
            !paymentMode
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Date, category, recovery amount and payment mode are required",
            });
        }

        // Validate category ID
        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        // Validate amount
        if (Number(recoveryAmount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Recovery amount must be greater than 0",
            });
        }

        const recoveryExpense =
            await RecoveryExpense.findByIdAndUpdate(
                id,
                {
                    date,
                    category,
                    recoveryAmount,
                    remarks,
                    paymentMode,
                },
                {
                    new: true,
                    runValidators: true,
                }
            ).populate("category");

        if (!recoveryExpense) {
            return res.status(404).json({
                success: false,
                message: "Recovery expense not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Recovery expense updated successfully",
            recoveryExpense,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Delete Recovery Expense
export const deleteRecoveryExpense = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid recovery expense ID",
            });
        }

        const recoveryExpense =
            await RecoveryExpense.findByIdAndDelete(id);

        if (!recoveryExpense) {
            return res.status(404).json({
                success: false,
                message: "Recovery expense not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Recovery expense deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};