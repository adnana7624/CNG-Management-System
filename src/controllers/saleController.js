import {Sale} from "../models/saleModel.js";

export const createSale = async(req , res)=>{
    try {
        const {date , cngVolume , amount , paymentMethod , notes} = req.body;
        if(!date || !cngVolume || !amount)
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "error during add sale ",
            message : error.message
        })
    }
}