import { getLedger } from "../controllers/ledgerController.js";
import {auth} from "../middleware/authMiddleware.js";
import express from "express";

const ledgerRoutes = express.Router();

ledgerRoutes.get("/getLedger",auth,getLedger);

export default ledgerRoutes;