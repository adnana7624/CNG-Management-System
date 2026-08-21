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
        const totalSale = await Sale.countDocuments();
        const recieptNo = `S.no-${String(totalSale+1).padStart(5,"0")}`;

        const sale = await Sale.create({
            admin : adminId,
            receiptNo : recieptNo,
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
        const saleId = req.user.id;

        const sales = await Sale.find({admin : adminId}).populate("admin", "adminName email PumpName")
        .sort({date :-1});

        const totalCngVolume = sales.reduce((total,sale) => total+sale.cngVolume,0);

        const totalRevenue = sales.reduce((total , sale) => total+sale.amount,0);

        return res.status(200).json({
            success : true,
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
            message : error.message
        })
    }
}