import express from "express";
import { loginSuperAdmin } from "../controllers/superAdminController.js";
import {auth} from "../middleware/authMiddleware.js";
import { createAdmin, getAllAdmins, getSingleAdmin, updateAdmin } from "../controllers/createAdminController.js";
import { adminLogin } from "../controllers/adminController.js";


const router = express.Router();
router.post("/superadminlogin",loginSuperAdmin)

router.post("/createAdmin",auth,createAdmin)
router.get("/getAllAdmins",auth,getAllAdmins)
router.get("/getSingleAdmin/:id",auth,getSingleAdmin)
router.put("/updateAdmin/:id",updateAdmin)

// admin login
router.post("/adminlogin",adminLogin)


export default router;