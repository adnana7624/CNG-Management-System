import express from "express";
import { getAdminProfile } from "../controllers/profileController.js";
import { auth } from "../middleware/authMiddleware.js";

const profileRoutes = express.Router();

profileRoutes.get("/adminProfile",auth,getAdminProfile);

export default profileRoutes;
