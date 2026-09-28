import mongoose from "mongoose";
import { RecoveryExpense } from "../models/recoveryExpenseModel.js";

// Create Recovery Expense
export const createRecoveryExpense = async (req, res) => {
    try {
        const adminId = req.user.id;

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
            admin: adminId,
            date,
            category,
            recoveryAmount,
            remarks,
            paymentMode,
        });

        return res.status(201).json({
            success: true,
            message: "Recovery expense created successfully",
            recoveryExpense,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Get All Recovery Expenses
export const getRecoveryExpenses = async (req, res) => {
    try {
        const adminId = req.user.id;

        const recoveryExpenses = await RecoveryExpense.find({
            admin: adminId,
        })
            .populate("category")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: recoveryExpenses.length,
            recoveryExpenses,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Update Recovery Expense
export const updateRecoveryExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const adminId = req.user.id;

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

        const recoveryExpense = await RecoveryExpense.findOneAndUpdate(
            {
                _id: id,
                admin: adminId,
            },
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

        return res.status(200).json({
            success: true,
            message: "Recovery expense updated successfully",
            recoveryExpense,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Delete Recovery Expense
export const deleteRecoveryExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const adminId = req.user.id;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid recovery expense ID",
            });
        }

        const recoveryExpense = await RecoveryExpense.findOneAndDelete({
            _id: id,
            admin: adminId,
        });

        if (!recoveryExpense) {
            return res.status(404).json({
                success: false,
                message: "Recovery expense not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Recovery expense deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};