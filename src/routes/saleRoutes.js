import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { createSale, deleteSale, getAllSale, getSingleSale, updateSale } from "../controllers/saleController.js";


const saleRoutes = express.Router();

// add sale record api
saleRoutes.post("/addSale",auth,createSale);

// get all  daily weekly and monthly sale api
saleRoutes.get("/getAllSale",auth,getAllSale);

// update sale api
saleRoutes.put("/updateSale/:id",auth,updateSale);

// get single sale api
saleRoutes.get("/getSingleSale/:id",auth,getSingleSale);

saleRoutes.delete("/deleteSale/:id",auth,deleteSale)





export default saleRoutes;