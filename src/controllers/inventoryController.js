import mongoose from "mongoose";
import {Inventory} from "../models/inventoryModel.js";

export const createInventoryItem = async(req , res)=>{
    try {
        const adminId = req.user.id;

        const{itemName , price , quantity , remarks} = req.body;
        if(!itemName || !price || !quantity){
            return res.status(400).json({
                message : "all field are required"
            })
        }

        const item = await Inventory.create({
            admin : adminId,
            itemName : itemName.trim(),
            price : Number(price),
            quantity : Number(quantity),
            remarks : remarks ? remarks.trim() :""
        })

        return res.status(201).json({
            success : true,
            message : "Inventory Item add successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}

export const getAllInventoryItem = async(req ,res) => {
    try {
        const adminId = req.user.id;

        const items = await Inventory.find({admin : adminId}).sort({createdAt : -1}).lean();

        return res.status(200).json({
            success : true,
            count : items.length,
            items
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}

export const updateInventoryItem = async (req , res) =>{
    try {
        const {id} = req.params;
        const adminId = req.user.id;

        const {itemName , quantity , price , remarks}= req.body;

        const item = await Inventory.findOne({_id : id,admin : adminId})
        if(!item){
            return res.status(404).json({message : "item not found to update"})
        }

        // update inventory item
        if(itemName !== undefined){
            item.itemName = itemName.trim()
        }
        if(quantity !== undefined){
            item.quantity = Number(quantity);
        }
        if(price !== undefined){
            item.price = Number(price);
        }
        if(remarks !== undefined){
            item.remarks = remarks.trim()
        }

        await item.save();

        return res.status(200).json({message : "item update successfully"})
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}

export const deleteInventoryItem = async (req ,res) =>{
    try {
        const {id} = req.params;
        const adminId = req.user.id;

        const item = await Inventory.findOne({_id : id , admin : adminId});
        if(!item){
            return res.status(404).json({message : "item not found to delete it"})
        }

        await Inventory.findByIdAndDelete(id);

        return res.status(200).json({message : "item deleted successfully"})

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}
