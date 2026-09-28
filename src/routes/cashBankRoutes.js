import express from "express";

import { createCashBankTransfer, createOpeningBalnce, deleteCashBankTransfer, getCashBank } from "../controllers/cashBankController.js";
import { auth } from "../middleware/authMiddleware.js";

const cashBankRoutes = express.Router();

cashBankRoutes.get("/getCashBank",auth,getCashBank);

cashBankRoutes.post("/transfer",auth,createCashBankTransfer)

cashBankRoutes.delete("/deleteTransaction/:id",auth , deleteCashBankTransfer);

// add opening balance
cashBankRoutes.post("/openingBalance",auth,createOpeningBalnce);


export default cashBankRoutes;