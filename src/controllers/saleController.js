import mongoose from "mongoose";
import { Sale } from "../models/saleModel.js";

export const createSale = async (req, res) => {
    try {
        const { date, cngVolume, amount, paymentMethod, notes } = req.body;

        if (!date || !cngVolume || !amount || !paymentMethod) {
            return res.status(400).json({ message: "all fields are required" })
        }

        const adminId = req.user.id;

        if (Number(cngVolume) <= 0) {
            return res.status(400).json({ message: "cng volume must be greater than 0" })
        }
        if(Number(amount) <= 0){
            return res.status(400).json({message : "amount must greate thjan 0"})
        }

        if(!["bank transfer" ,"cash"].includes(paymentMethod)){
            return res.status(403).json({message : "payment method should be bank transfer or cash"})
        }

        // generate reciept numver
        // const totalSale = await Sale.countDocuments();
        // const recieptNo = `S.no-${String(totalSale+1).padStart(5,"0")}`;

        const sale = await Sale.create({
            admin : adminId,
            // receiptNo : recieptNo,
            date ,
            cngVolume : Number(cngVolume),
            amount : Number(amount),
            paymentMethod,
            notes : notes || "",
            status : "completed"
        })

        return res.status(201).json({
            message : "Sale recorded successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "error during add sale ",
            message: error.message
        })
    }
}

export const getAllSale = async(req , res) =>{
    try {
        const adminId = req.user.id;

        // get time period form qurey
        const {period} = req.query;

        // current date
        const now = new Date();

        let startDate;
        let endDate;
        
        // Dailly refort
        if(period === "daily"){
            startDate = new Date(now);
            startDate.setHours(0,0,0,0);

            endDate = new Date(now);
            endDate.setHours(23,59,59,999);
        }

        // weekly refort
        else if(period === "weekly"){
            startDate = new Date(now);
            
            // get monday of current week
            const day = startDate.getDay();
            const difference = day === 0 ? 6: day-1;

            startDate.setDate(startDate.getDate() - difference);
            startDate.setHours(0,0,0,0);

            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            endDate.setHours(23,59,59,999);

        }
        // monthly refort
        else if(period === "monthly"){
            startDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );
            startDate.setHours(0,0,0,0);

            endDate = new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0
            );
            endDate.setHours(23,59,59,999);

        }
        else if(period){
            return res.status(400).json({message : "invalid period use daily , monthly or weekly"})
        }

        const query = {admin : adminId};
        
        // add date filter only if period exist

        if(startDate && endDate){
            query.date = {
                $gte : startDate,
                $lte : endDate
            };
        }

        // get sale
        const sales = await Sale.find(query).populate("admin", "adminName email pumpName").sort({date :-1});

        // to dkip cancelled sale from sale history only ad d completed sael
        const completedSales = sales.filter((sale) => sale.status === "completed");

        const totalCngVolume = completedSales.reduce((total,sale) => total+sale.cngVolume,0);

        const totalRevenue = completedSales.reduce((total , sale) => total+sale.amount,0);

        return res.status(200).json({
            success : true,
            period : period || "all",
            count : sales.length,
            summary : {
                totalCngVolume,
                totalRevenue
            },
            sales
        })

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "error in geting all sale",
            message : error.message,
            
        })
    }
}

export const getSingleSale = async(req ,res) =>{
    try {
        const saleId = req.params.id;
        const adminId = req.user.id;

        const sales = await Sale.findOne({admin : adminId
        }).populate("admin", "adminName pumpName pumpAddress");

        if(!sales){
            return res.status(400).json({message : "no sales found on this id"})
        }

        return res.status(200).json({
            success : true,
            sales
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "errror during geting single sale",
            message : error.message
        })
    }
}

export const updateSale = async(req , res) =>{
    try {
        const {id} = req.params;

        const {date , cngVolume , amount , paymentMethod, notes , status} = req.body;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message : "invalid sale ID"})
        }

        const adminId = req.user.id;

        const sale = await Sale.findById({_id : id , admin : adminId})

        if(!sale){
            return res.status(404).json({message : "sale not found to update"})
        }

        if(sale.status === "cancelled"){
            return res.status(400).json({message : "cancel sale can't be updated"})
        }

        // jupdate record
        if(date !== undefined){
            if(!date){
                return res.status(400).json({message : "date cannot be empty"})
            }
            sale.date = date;
        }

        if(cngVolume !== undefined){
            if(Number(cngVolume) <= 0){
                return res.status(404).json({message : "cng colume must greater than 0"})
            }
            sale.cngVolume = cngVolume;
        }

        if(amount !== undefined){
            if(Number(amount) <= 0){
                return res.status(404).json({message : "amount must greter than 0"})
            }
            sale.amount = amount;

        }

        if(paymentMethod !== undefined){
            if(!["cash", "bank transfer"].includes(paymentMethod)){
                return res.status(404).json({message : "paument method must be cash or bank transfer"})
            }
            sale .paymentMethod = paymentMethod
        }

        if(notes !== undefined){
            sale.notes = notes
        }

        if(status !== undefined){
            sale.status = status
        }

        await sale.save();
        
        return res.status(200).json({
            success : true ,
            message : "sale updated succesfully"
        })

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "error during update sale",
            message : error.message
        })
    }
}

export const deleteSale = async(req , res) =>{
    try {
        const {id} = req.params;

        const sale = await Sale.findById(id)
        if(!sale){
            return res.status(400).json({message : "sale not found to delete"})
        }

        await Sale.findByIdAndDelete(id)

        return res.status(200).json({message : "sale deleted successfully"});
        
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}