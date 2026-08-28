import {Loan} from "../models/loanModel.js";

export const createLoan = async (req , res) =>{
    try {
        const adminId = req.user.id;

        const {date , loanType , name , amount , status , paymentType , remarks } = req.body;

        // validate date
        if(!date){
            return res.status(400).json({message : "Date is required"})
        }
        const loanDate = new Date(date);

        // validate loan tupe
        if(!["loan_given" , "loan_received"].includes(loanType)){
            return res.status(400).json({message : "loan tyep must be loan_given or loan_received"})
        }

        // vlaidate naem
        if(!name || name.trim() === ""){
            return res.status(400).json({message : "name is required"})
        }

        // validate amount
        if(amount === undefined || amount === null || Number(amount)<=0){
            return res.status(400).json({message : "amount must be greater than 0"})
        }

        const loanAmount = Number(amount);

        // validate status
        if(!["active" , "paid"].includes(status)){
            return res.status(400).json({message : "status must be active or paid"})
        }

        if(!["cash" , "bank transfer"].includes(paymentType)){
            return res.status(400).json({message : "paymentTupe must be cash or bank transfer"})
        }

        const loan = await Loan.create({
            admin : adminId,
            date : loanDate,
            loanType,
            name : name.trim(),
            amount : loanAmount,
            status : status || "active",
            paymentType,
            remarks : remarks?remarks.trim() : ""
        })

        return res.status(201).json({
            success : true,
            message : "loan added successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}

export const getAllLoans = async(req , res) => {
    try {
        const adminId = req.user.id;

        const loans = await Loan.find({admin: adminId}).sort({date : -1, createdAt : -1}).lean();

        return res.status(200).json({
            success : true,
            count : loans.length,
            loans
        })

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}