// 
import express from "express";

import {
    createDieselExpense,
    getDieselExpenses,
    updateDieselExpense,
    deleteDieselExpense,
} from "../controllers/dieselExpenseController.js";
import { auth } from "../middleware/authMiddleware.js";
const router = express.Router();

// Create Diesel Expense
router.post("/create",auth, createDieselExpense);

// Get All Diesel Expenses
router.get("/get",auth, getDieselExpenses);

// Update Diesel Expense
router.put("/:id",auth, updateDieselExpense);

// Delete Diesel Expense
router.delete("/:id",auth, deleteDieselExpense);

export default router;