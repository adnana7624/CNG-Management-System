import express from "express";

import {
  createExpenseCategory,
  getExpenseCategories,
  updateExpenseCategory,
  deleteExpenseCategory
} from "../controllers/expenseCategoryController.js";

import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", auth, createExpenseCategory);

router.get("/get", getExpenseCategories);

router.put("/:id", updateExpenseCategory);

router.delete("/:id", auth, deleteExpenseCategory);

export default router;