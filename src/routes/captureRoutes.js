import {  completeCapture, getCaptureHistory, uploadCaptureImage } from "../controllers/captureController.js";
import { auth } from "../middleware/authMiddleware.js";
import {upload} from "../middleware/multerMiddleware.js";
import express from "express";

const captureRoutes = express.Router();

// start captuing images
captureRoutes.post("/captureImage",auth,upload.single("image"),uploadCaptureImage);

// complete or done captured images
captureRoutes.post("/complete/:captureId",auth,completeCapture);

// get capture history
captureRoutes.get("/history",auth , getCaptureHistory);


export default captureRoutes;


