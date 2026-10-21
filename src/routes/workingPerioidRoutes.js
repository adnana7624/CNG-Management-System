import express from "express";

import {
  getWorkingPeriod,
  closeWorkingPeriod,
} from "../controllers/workingPeriodController.js";

import { auth } from "../middleware/authMiddleware.js";

const workingPeriodRoutes = express.Router();

workingPeriodRoutes.get("/", auth, getWorkingPeriod);

workingPeriodRoutes.post("/close", auth, closeWorkingPeriod);

export default workingPeriodRoutes;