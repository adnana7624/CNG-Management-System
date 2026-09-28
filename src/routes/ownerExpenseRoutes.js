import express from "express";

import {
    createOwnerExpense,
    getOwnerExpenses,
    updateOwnerExpense,
    deleteOwnerExpense,
} from "../controllers/ownerExpenseController.js";

import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", auth, createOwnerExpense);

router.get("/get", auth, getOwnerExpenses);

router.put("/:id", auth, updateOwnerExpense);

router.delete("/:id", auth, deleteOwnerExpense);

export default router;