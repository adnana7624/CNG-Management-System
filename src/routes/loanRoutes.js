import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { createLoan } from "../controllers/loanController.js";


const loanRoutes = express.Router();

loanRoutes.post("/createLoan",auth, createLoan);

export default loanRoutes;