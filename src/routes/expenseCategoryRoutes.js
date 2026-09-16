import express from "express";
import {
    createExpenseCategory,
    getExpenseCategories,
    updateExpenseCategory,
    deleteExpenseCategory
} from "../controllers/expenseCategoryController.js";

const router = express.Router();

router.post("/create", createExpenseCategory);
router.get("/get", getExpenseCategories);
router.put("/:id", updateExpenseCategory);
router.delete("/:id", deleteExpenseCategory);


export default router;