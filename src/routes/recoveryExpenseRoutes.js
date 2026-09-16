import express from "express";

import {
    createRecoveryExpense,
    getRecoveryExpenses,
    updateRecoveryExpense,
    deleteRecoveryExpense,
} from "../controllers/recoveryExpenseController.js";

const router = express.Router();
router.post("/create", createRecoveryExpense);
router.get("/get", getRecoveryExpenses);
router.put("/:id", updateRecoveryExpense);
router.delete("/:id", deleteRecoveryExpense);

export default router;