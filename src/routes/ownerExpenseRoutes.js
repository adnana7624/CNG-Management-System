import express from "express";
import {
    createOwnerExpense,
    getOwnerExpenses,
} from "../controllers/ownerExpenseController.js";

const router = express.Router();

router.post("/create", createOwnerExpense);
router.get("/get", getOwnerExpenses);

export default router;    