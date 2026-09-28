import mongoose from "mongoose";
import { OwnerExpense } from "../models/ownerExpenseModel.js";

// Create Owner Expense
export const createOwnerExpense = async (req, res) => {
    try {
        const adminId = req.user.id;

        const {
            date,
            amount,
            paymentMode,
            owner,
            status,
            remarks,
        } = req.body;

        if (!date || amount === undefined || !paymentMode || !owner) {
            return res.status(400).json({
                success: false,
                message: "Date, amount, payment mode and owner are required",
            });
        }

        const ownerExpense = await OwnerExpense.create({
            admin: adminId,
            date,
            amount,
            paymentMode,
            owner,
            status,
            remarks,
        });

        return res.status(201).json({
            success: true,
            message: "Owner expense created successfully",
            ownerExpense,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Get All Owner Expenses
export const getOwnerExpenses = async (req, res) => {
    try {
        const adminId = req.user.id;

        const ownerExpenses = await OwnerExpense.find({
            admin: adminId,
        })
            .populate("owner")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: ownerExpenses.length,
            ownerExpenses,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Update Owner Expense
export const updateOwnerExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const adminId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid owner expense ID",
            });
        }

        const {
            date,
            amount,
            paymentMode,
            owner,
            status,
            remarks,
        } = req.body;

        if (!date || amount === undefined || !paymentMode || !owner) {
            return res.status(400).json({
                success: false,
                message: "Date, amount, payment mode and owner are required",
            });
        }

        const ownerExpense = await OwnerExpense.findOneAndUpdate(
            {
                _id: id,
                admin: adminId,
            },
            {
                date,
                amount,
                paymentMode,
                owner,
                status,
                remarks,
            },
            {
                new: true,
                runValidators: true,
            }
        ).populate("owner");

        if (!ownerExpense) {
            return res.status(404).json({
                success: false,
                message: "Owner expense not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Owner expense updated successfully",
            ownerExpense,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Delete Owner Expense
export const deleteOwnerExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const adminId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid owner expense ID",
            });
        }

        const ownerExpense = await OwnerExpense.findOneAndDelete({
            _id: id,
            admin: adminId,
        });

        if (!ownerExpense) {
            return res.status(404).json({
                success: false,
                message: "Owner expense not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Owner expense deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};