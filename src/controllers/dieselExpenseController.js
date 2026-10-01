import mongoose from "mongoose";
import { DieselExpense } from "../models/dieselExpenseModel.js";

// Create Diesel Expense
export const createDieselExpense = async (req, res) => {
    try {
        const adminId = req.user.id;

        const {
            date,
            dieselQuantity,
            amount,
            remarks,
        } = req.body;

        if (!date || dieselQuantity === undefined || amount === undefined) {
            return res.status(400).json({
                success: false,
                message: "Date, diesel quantity and amount are required",
            });
        }

        if (Number(dieselQuantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Diesel quantity must be greater than 0",
            });
        }

        if (Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than 0",
            });
        }

        const dieselExpense = await DieselExpense.create({
            admin: adminId,
            date,
            dieselQuantity,
            amount,
            remarks,
        });

        return res.status(201).json({
            success: true,
            message: "Diesel expense created successfully",
            dieselExpense,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Get All Diesel Expenses
export const getDieselExpenses = async (req, res) => {
    try {
        const adminId = req.user.id;

        const dieselExpenses = await DieselExpense.find({
            admin: adminId,
        }).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            count: dieselExpenses.length,
            dieselExpenses,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Update Diesel Expense
export const updateDieselExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const adminId = req.user.id;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid diesel expense ID",
            });
        }

        const {
            date,
            dieselQuantity,
            amount,
            remarks,
        } = req.body;

        // Required fields
        if (!date || dieselQuantity === undefined || amount === undefined) {
            return res.status(400).json({
                success: false,
                message: "Date, diesel quantity and amount are required",
            });
        }

        // Validate quantity
        if (Number(dieselQuantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Diesel quantity must be greater than 0",
            });
        }

        // Validate amount
        if (Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than 0",
            });
        }

        const dieselExpense = await DieselExpense.findOneAndUpdate(
            {
                _id: id,
                admin: adminId,
            },
            {
                date,
                dieselQuantity,
                amount,
                remarks,
            },
            {
                returnDocument : "after",
                runValidators: true,
            }
        );

        if (!dieselExpense) {
            return res.status(404).json({
                success: false,
                message: "Diesel expense not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Diesel expense updated successfully",
            dieselExpense,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Delete Diesel Expense
export const deleteDieselExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const adminId = req.user.id;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid diesel expense ID",
            });
        }

        const dieselExpense = await DieselExpense.findOneAndDelete({
            _id: id,
            admin: adminId,
        });

        if (!dieselExpense) {
            return res.status(404).json({
                success: false,
                message: "Diesel expense not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Diesel expense deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};