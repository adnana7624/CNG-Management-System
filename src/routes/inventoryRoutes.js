import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { createInventoryItem, deleteInventoryItem, getAllInventoryItem, updateInventoryItem } from "../controllers/inventoryController.js";


const inventoryRoutes = express.Router();

inventoryRoutes.post("/createInventory",auth,createInventoryItem);

inventoryRoutes.get("/getAllInventoryItem",auth,getAllInventoryItem);

inventoryRoutes.put("/updateItem/:id",auth,updateInventoryItem);

inventoryRoutes.delete("/deleteItem/:id",auth,deleteInventoryItem);


export default inventoryRoutes;
