import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { createLoan, deleteLoan, getAllLoans, updateLoan } from "../controllers/loanController.js";


const loanRoutes = express.Router();

loanRoutes.post("/createLoan",auth, createLoan);

loanRoutes.get("/getAllLoan",auth,getAllLoans);

loanRoutes.put("/updateLoan/:id",auth,updateLoan);

loanRoutes.delete("/deleteLoan/:id",auth,deleteLoan);

export default loanRoutes;