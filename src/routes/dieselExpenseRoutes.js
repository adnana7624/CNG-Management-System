// 
import express from "express";

import {
    createDieselExpense,
    getDieselExpenses,
    updateDieselExpense,
    deleteDieselExpense,
} from "../controllers/dieselExpenseController.js";

const router = express.Router();

// Create Diesel Expense
router.post("/create", createDieselExpense);

// Get All Diesel Expenses
router.get("/get", getDieselExpenses);

// Update Diesel Expense
router.put("/:id", updateDieselExpense);

// Delete Diesel Expense
router.delete("/:id", deleteDieselExpense);

export default router;