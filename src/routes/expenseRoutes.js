import express from "express";

import {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Expense
router.post("/createexpense", auth, createExpense);

// Get Expenses
router.get("/getexpense", auth, getExpenses);

// Update Expense
router.put("/:id", auth, updateExpense);

// Delete Expense
router.delete("/:id", auth, deleteExpense);

export default router;