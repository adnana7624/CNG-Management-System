import express from "express";

import { auth } from "../middleware/authMiddleware.js";
import { getDashboard } from "../controllers/dashboardController.js";


const dashboardRoutes = express.Router();

dashboardRoutes.get("/getDashboard",auth , getDashboard);

export default dashboardRoutes ;