import express from "express";

import { createCashBankTransfer, getCashBank } from "../controllers/cashBankController.js";
import { auth } from "../middleware/authMiddleware.js";

const cashBankRoutes = express.Router();

cashBankRoutes.get("/getCashBank",auth,getCashBank);

cashBankRoutes.post("/transfer",auth,createCashBankTransfer)

export default cashBankRoutes;