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

    // Required fields
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

    // Logged-in admin
    const adminId = req.user.id;

    const expense = await Expense.create({
      admin: adminId,
      date,
      amount,
      category,
      paymentMode,
      status,
      remarks,
    });

    return res.status(201).json({
      success: true,
      message: "Expense created successfully",
      expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Expenses
export const getExpenses = async (req, res) => {
  try {
    // Logged-in admin
    const adminId = req.user.id;

    // Only logged-in admin's expenses
    const expenses = await Expense.find({
      admin: adminId,
    })
      .populate("category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Expense
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;

    // Expense ID validation
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

    // Required fields
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

    // Category validation
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const adminId = req.user.id;

    // Update only this admin's expense
    const expense = await Expense.findOneAndUpdate(
      {
        _id: id,
        admin: adminId,
      },
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

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Expense
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    // Expense ID validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense ID",
      });
    }

    const adminId = req.user.id;

    // Delete only this admin's expense
    const expense = await Expense.findOneAndDelete({
      _id: id,
      admin: adminId,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

