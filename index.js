import express, { json, urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";


// import routes
import authRoutes from "./src/routes/authRoutes.js";
import saleRoutes from "./src/routes/saleRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";

import cashBankRoutes from "./src/routes/cashBankRoutes.js";
import loanRoutes from "./src/routes/loanRoutes.js";
import inventoryRoutes from "./src/routes/inventoryRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import ledgerRoutes from "./src/routes/ledgerRoutes.js";

import expenseRoutes from "./src/routes/expenseRoutes.js";
import expenseCategoryRoutes from "./src/routes/expenseCategoryRoutes.js";
import recoveryExpenseRoutes from "./src/routes/recoveryExpenseRoutes.js";
import dieselExpenseRoutes from "./src/routes/dieselExpenseRoutes.js";
import ownerExpenseRoutes from "./src/routes/ownerExpenseRoutes.js";
import dashboardRoutes from "./src/routes/dashBoardRoutes.js";
import captureRoutes from "./src/routes/captureRoutes.js";


const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admins", adminRoutes)
app.use("/api/v1/sales", saleRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/expenseCategory", expenseCategoryRoutes);
app.use("/api/v1/recoveryExpense", recoveryExpenseRoutes);
app.use("/api/v1/dieselExpense", dieselExpenseRoutes);
app.use("/api/v1/ownerExpense", ownerExpenseRoutes);


app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/admins",adminRoutes)
app.use("/api/v1/sales",saleRoutes);
app.use("/api/v1/cashBank",cashBankRoutes);
app.use("/api/v1/loans", loanRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/profile",profileRoutes);
app.use("/api/v1/ledger",ledgerRoutes);
app.use("/api/v1/dashboard",dashboardRoutes);
app.use("/api/v1/capture",captureRoutes);

app.get("/",(req ,res)=>{
    // console.log("app runnig succesfuly")
    return res.status(200).json({message : "backend runing on succesfuly"})

})

connectDB();

const port = process.env.PORT || 3000;


app.listen(port , "0.0.0.0", ()=>{
    console.log(`server running  on PORT NO = ${port}`);
});
