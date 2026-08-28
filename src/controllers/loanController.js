import mongoose from "mongoose";
import {Loan} from "../models/loanModel.js";

export const createLoan = async (req , res) =>{
    try {
        const adminId = req.user.id;

        const {date , loanType , name , amount  , paymentType , remarks , linkedLoan } = req.body;

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

        // // validate status
        // if(!["active" , "paid"].includes(status)){
        //     return res.status(400).json({message : "status must be active or paid"})
        // }

        if(!["cash" , "bank transfer"].includes(paymentType)){
            return res.status(400).json({message : "paymentTupe must be cash or bank transfer"})
        }

        // if this  is a new lona

        if(!linkedLoan){
            const loan = await Loan.create({
                admin : adminId,
                date : loanDate,
                loanType,
                name : name.trim(),
                amount : loanAmount,
                remainingBalance : loanAmount,
                status : "active",
                paymentType,
                remarks : remarks?remarks.trim():"",
                linkedLoan : null
                });
            return res.status(201).json({
            success : true,
            message : "loan added successfully"
            })
        }

        

        // validate linkedloan ID

        if(!mongoose.Types.ObjectId.isValid(linkedLoan)){
            return res.status(400).json({message : "invalid linkedLoan id"})
        }

        // find original loan
        const originalLoan = await Loan.findOne({
            _id : linkedLoan,
            admin : adminId
        })
        if(!originalLoan){
            return res.status(404).json({message : "original laon not found"})
        }

        // original loan must be active
        if(originalLoan.remainingBalance <= 0 || originalLoan.status === "paid"){
            return res.status(400).json({message : "this loan is already paid"})
        }

        // payment must be opposite type
        const expectedLoanType = originalLoan.loanType === "loan_given"?"loan_received":"loan_given";

        if(loanType !== expectedLoanType){
            return res.status(400).json({
                message : `For ${originalLoan.loanType} , settelement must be ${expectedLoanType}`
            })
        }

        // name must match
        if(name.trim().toLowerCase() !== originalLoan.name.trim().toLowerCase()){
            return res.status(400).json({message : "name does not match the original loan name"})
        }

        // paument canot exceed remaining
        if(loanAmount > originalLoan.remainingBalance){
            return res.status(400).json({
                success : true,
                message : "laon amount canot exceed remainig balance ",
                remainingBalance : originalLoan.remainingBalance
            })
        }

        // calculate new remainig balance
        const newRemainingBalance = originalLoan.remainingBalance-loanAmount;

        const newStatus = newRemainingBalance === 0 ? "paid" : "active"

        // update orignial loan
        originalLoan.remainingBalance = newRemainingBalance;
        originalLoan.status = newStatus;
        
        await originalLoan.save();

        // create settlement transaction

        const settlement = await Loan.create({
            admin : adminId,
            date : loanDate,
            loanType,
            name : name.trim(),
            amount : loanAmount,
            remainingBalance : newRemainingBalance,
            status : newStatus,
            paymentType,
            remarks : remarks?remarks.trim():"",
            linkedLoan : originalLoan._id
        })

        return res.status(201).json({
            success : true,
            message : newRemainingBalance ===0? "loan fully paid " : "lona payment record successfully"
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

export const updateLoan = async(req , res) => {
    try {
        
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}