import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { createSale } from "../controllers/saleController.js";


const saleRoutes = express.Router();

// add sale record api
saleRoutes.post("/addSale",auth,createSale);





export default saleRoutes;