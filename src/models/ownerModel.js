import mongoose from "mongoose";

const ownerSchema = new mongoose.Schema({
    ownerName : {
        type : String,
        required : true
    },
    admin : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Admin"
    }
},{timestamps : true});

export const Owner = mongoose.model("Owner",ownerSchema);