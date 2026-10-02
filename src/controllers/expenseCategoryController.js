import mongoose from "mongoose";
import { ExpenseCategory } from "../models/expenseCategoryModel.js";

// Create Expense Category
export const createExpenseCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const adminId = req.user.id;

        // Validate name
        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }

        const categoryName = name.trim();

        // Check duplicate category for same admin
        const existingCategory = await ExpenseCategory.findOne({
            admin: adminId,
            name: categoryName,
        }).collation({
            locale: "en",
            strength: 2,
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "This category already exists",
            });
        }

        const expenseCategory = await ExpenseCategory.create({
            name: categoryName,
            admin: adminId,
        });

        return res.status(201).json({
            success: true,
            message: "Expense category created successfully",
            expenseCategory,
        });
    } catch (error) {
        // MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This category already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create expense category",
            error: error.message,
        });
    }
};

// Get All Expense Categories
export const getExpenseCategories = async (req, res) => {
    try {
        // const adminId = req.user.id;

        // const expenseCategories = await ExpenseCategory.find({
        //     admin: adminId,
        // }).sort({
        //     createdAt: -1,
        // });
        const expenseCategories = await ExpenseCategory.find();

        return res.status(200).json({
            success: true,
            count: expenseCategories.length,
            expenseCategories,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch expense categories",
            error: error.message,
        });
    }
};

// Update Expense Category
export const updateExpenseCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const adminId = req.user.id;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        // Validate name
        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }

        const categoryName = name.trim();

        // Check duplicate category
        const existingCategory = await ExpenseCategory.findOne({
            admin: adminId,
            name: categoryName,
            _id: { $ne: id },
        }).collation({
            locale: "en",
            strength: 2,
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "This category already exists",
            });
        }

        const expenseCategory = await ExpenseCategory.findOneAndUpdate(
            {
                _id: id,
                admin: adminId,
            },
            {
                name: categoryName,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!expenseCategory) {
            return res.status(404).json({
                success: false,
                message: "Expense category not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Expense category updated successfully",
            expenseCategory,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This category already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update expense category",
            error: error.message,
        });
    }
};

// Delete Expense Category
export const deleteExpenseCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        const expenseCategory = await ExpenseCategory.findOneAndDelete({
            _id: id,
            admin: adminId,
        });

        if (!expenseCategory) {
            return res.status(404).json({
                success: false,
                message: "Expense category not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Expense category deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete expense category",
            error: error.message,
        });
    }
}