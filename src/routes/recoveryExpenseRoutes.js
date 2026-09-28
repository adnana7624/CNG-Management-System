import express from "express";
import { auth } from "../middleware/authMiddleware.js";

import {
    createRecoveryExpense,
    getRecoveryExpenses,
    updateRecoveryExpense,
    deleteRecoveryExpense,
} from "../controllers/recoveryExpenseController.js";

const router = express.Router();
router.post("/create",auth, createRecoveryExpense);
router.get("/get",auth, getRecoveryExpenses);
router.put("/:id",auth, updateRecoveryExpense);
router.delete("/:id",auth, deleteRecoveryExpense);

export default router; 