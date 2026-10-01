import express from "express";

import {
    createOwnerExpense,
    getOwnerExpenses,
    updateOwnerExpense,
    deleteOwnerExpense,
    getOwnerDatails,
    addOwner,
    getOwner,
} from "../controllers/ownerExpenseController.js";

import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// create Owner first
router.post("/createOwner",auth,addOwner);

// get owner
router.get("/getOwner",auth,getOwner);

router.post("/create", auth, createOwnerExpense);

router.get("/get", auth, getOwnerExpenses);

router.get("/owner/:ownerId/details",auth,getOwnerDatails);

router.put("/:id", auth, updateOwnerExpense);

router.delete("/:id", auth, deleteOwnerExpense);

export default router;