import express from "express";

import { createCashBankTransfer, deleteCashBankTransfer, getCashBank } from "../controllers/cashBankController.js";
import { auth } from "../middleware/authMiddleware.js";

const cashBankRoutes = express.Router();

cashBankRoutes.get("/getCashBank",auth,getCashBank);

cashBankRoutes.post("/transfer",auth,createCashBankTransfer)

cashBankRoutes.delete("/deleteTransaction/:id",auth , deleteCashBankTransfer);

export default cashBankRoutes;