import express, { json, urlencoded } from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";

// import routes
import authRoutes from "./src/routes/authRoutes.js";
import saleRoutes from "./src/routes/saleRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";

const app = express();

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({extended : true}));


app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/admins",adminRoutes)
app.use("/api/v1/sales",saleRoutes);

app.get("/",()=>{
    console.log("app runnig succesfuly")
})
connectDB();

const port = process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`server running  on PORT NO = ${port}`)
})
