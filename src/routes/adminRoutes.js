import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { createAdmin, getAllAdmins, getSingleAdmin, updateAdmin } from "../controllers/createAdminController.js";


const adminRoutes = express.Router();

// create admin api

adminRoutes.post("/createAdmin",auth,createAdmin);

// get all admin api

adminRoutes.get("/getAllAdmins",auth,getAllAdmins);

// get single admin api

adminRoutes.get("/getSingleAdmin/:id",auth,getSingleAdmin);

// update admins api

adminRoutes.put("/updateAdmin/:id",auth , updateAdmin)



export default adminRoutes;