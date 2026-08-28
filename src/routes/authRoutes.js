import express from "express";
import { loginSuperAdmin } from "../controllers/superAdminController.js";
import {auth} from "../middleware/authMiddleware.js";
import { createAdmin, getAllAdmins, getSingleAdmin, updateAdmin } from "../controllers/createAdminController.js";
import { adminLogin } from "../controllers/adminLoginController.js";


const authRoutes = express.Router();

// super admin login api

authRoutes.post("/superadminlogin",loginSuperAdmin)

// admin login

authRoutes.post("/adminlogin",adminLogin)



export default authRoutes;