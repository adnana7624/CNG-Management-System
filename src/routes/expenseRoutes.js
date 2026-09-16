// import express from "express";
// import {
//     createExpenseCategory,
//     getExpenseCategories
// } from "../controllers/expenseController.js";
// import { auth } from "../middleware/authMiddleware.js";

// const router = express.Router()


// router.post("/creatCategory", auth, createExpenseCategory);
// router.get("/getCategory", auth, getExpenseCategories);

// export default router;





import express from "express";
import {
    createExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
} from "../controllers/expenseController.js";

const router = express.Router();

router.post("/createexpense", createExpense);
router.get("/getexpense", getExpenses);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;