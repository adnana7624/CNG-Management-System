import express, { json, urlencoded } from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import cors from "cors";


// import routes
import authRoutes from "./src/routes/authRoutes.js";
import saleRoutes from "./src/routes/saleRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import expenseRoutes from "./src/routes/expenseRoutes.js";
import expenseCategoryRoutes from "./src/routes/expenseCategoryRoutes.js";
import recoveryExpenseRoutes from "./src/routes/recoveryExpenseRoutes.js";
import dieselExpenseRoutes from "./src/routes/dieselExpenseRoutes.js";
import ownerExpenseRoutes from "./src/routes/ownerExpenseRoutes.js";

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

app.get("/", () => {
    console.log("app runnig succesfuly")
})
connectDB();

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`server running  on PORT NO = ${port}`)
})
