import express, { json, urlencoded } from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import router from "./src/routes/userRoutes.js";


const app = express();
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use("/api/v1/auth",router)

app.get("/",()=>{
    console.log("app runnig succesfuly")
})
connectDB();

const port = process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`server running  on PORT NO = ${port}`)
})
