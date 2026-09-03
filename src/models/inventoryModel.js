import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
    admin:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Admin",
        required : true
    },
    itemName : {
        type : String,
        required : true,
        trim : true
    },
    price : {
        type : Number,
        required : true,
        min : 0
    },
    quantity : {
        type : Number,
        required : true,
        min : 0
    },
    remarks : {
        type : String,
        trim : true,
        required : true
    }
},{timestamps : true})

export const Inventory = mongoose.model("Inventory",inventorySchema);