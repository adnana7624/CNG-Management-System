import { OwnerExpense } from "../models/ownerExpenseModel.js";

// Create Owner Expense
export const createOwnerExpense = async (req, res) => {
    try {
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
            date,
            amount,
            paymentMode,
            owner,
            status,
            remarks,
        });

        res.status(201).json({
            success: true,
            message: "Owner expense created successfully",
            ownerExpense,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get All Owner Expenses
export const getOwnerExpenses = async (req, res) => {
    try {
        const ownerExpenses = await OwnerExpense.find()
            .populate("owner")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: ownerExpenses.length,
            ownerExpenses,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};