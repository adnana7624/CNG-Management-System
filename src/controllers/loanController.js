import mongoose, { set } from "mongoose";
import {Loan} from "../models/loanModel.js";

export const createLoan = async (req , res) =>{
    try {
        const adminId = req.user.id;

        const {date , loanType , name , amount  , paymentType  } = req.body;

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

        const loan = await Loan.create({
            admin : adminId,
            date : loanDate,
            loanType,
            name : name.trim(),
            amount : loanAmount,
            remainingBalance : loanAmount,
            status : "active",
            paymentType
            });
        return res.status(201).json({
        success : true,
        message : "loan added successfully"
        })
    }

    catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}

export const getAllLoans = async(req , res) => {
    try {
        const adminId = req.user.id;

        const currentDate = new Date();

        const startDate = new Date(currentDate.getFullYear(),currentDate.getMonth(),1,0,0,0,0);
        const endtDate = new Date(currentDate.getFullYear(),currentDate.getMonth()+1,1,0,0,0,0);

        const loans = await Loan.find({admin: adminId}).sort({date : -1, createdAt : -1}).lean();

        // this mont loan
        const thisMonthLoan = loans.reduce((total , loan) =>{
            if(loan.loanType === "loan_given" && loan.date >= startDate && loan.date < endtDate){
                return total+loan.amount
            }
            return total;
        },0
    )

    // total loan given

    const totalLoanGiven = loans.reduce((total,loan) =>{
        if(loan.loanType === "loan_given"){
            return total+loan.remainingBalance;
        }
        return total;
    },0
    )

    // this month loan received
    let thisMonthLoanReceived = 0;
    loans.forEach((loan) =>{
        // new loan received 
        if(loan.loanType === "loan_received" && loan.date>=startDate && loan.date < endtDate ){
            thisMonthLoanReceived += loan.amount
        }
    })

    // active loan staff 
    const activeLoanNames = new Set();
    loans.forEach((loan) =>{
        if(loan.loanType === "loan_given" && loan.remainingBalance >0 && loan.status === "active" ){
            activeLoanNames.add(loan.name.trim().toLowerCase()
            )
        }
    })

    const activeLoanStaff = activeLoanNames.size;

        return res.status(200).json({
            success : true,
            summary:{
                thisMonthLoan,
                totalLoanGiven,
                thisMonthLoanReceived,
                activeLoanStaff
            },
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
        const {id} = req.params;

        const adminId = req.user.id;

        const {date , loanType , name , amount , paymentType } = req.body;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message : "invalid id"})
        }

        const loan = await Loan.findOne({
            _id : id,
            admin : adminId
        })

        if(!loan){
            return res.status(400).json({message : "loan not found"})
        }

        // chechk loan status
        if(loan.status === "paid"){
            return res.status(400).json({message : "this loan already paid"})
        }
        
        // validate date
        if(!date){
            return res.status(400).json({message : "date is required"})
        }

        const transactionDate = new Date(date);

        // vlaidat4 loan tyep
        if(!["loan_given" , "loan_received"].includes(loanType)){
            return res.status(400).json({message : "loan type must be loan_given or loan_received"})
        }

        const expectedLoanType = loan.loanType === "loan_given"?"loan_received":"loan_given";
        if(loanType !== expectedLoanType){
            return res.status(400).json({
                success : false,
                message : `For ${loan.loanType} , update must be ${expectedLoanType}`
            })
        }

        if(!name || name.trim() === ""){
            return res.status(400).json({message : "name is required"})
        }

        if(name.trim().toLowerCase() !== loan.name.trim().toLocaleLowerCase()){
            return res.status(400).json({
                message : "given name does not match the orignal loan naem"
            })
        }

        // vlaidate amount
        if(amount === undefined || Number(amount) <=0){
            return res.status(400).json({message : "amount must be greater than 0"})
        }
        const paymentAmount = Number(amount)
        
        // payment cannot exceed lona amount
        if(paymentAmount > loan.remainingBalance){
            return res.status(400).json({
                message : "Payment cannot be more than the remaining balance.",
                remainingBalance : loan.remainingBalance
            })
        }

        // validate payment type
        if(!["cash","bank transfer"].includes(paymentType)){
            return res.status(400).json({message : "payment type must be cash or bank transfer"})
        }

        // calculate new remaining balance
        const newRemainingBalance = loan.remainingBalance - paymentAmount;

        const newStatus = newRemainingBalance === 0?"paid":"active"

        // add transaction to loan history
        loan.transactions.push({
            date : transactionDate,
            loanType,
            amount : paymentAmount,
            paymentType,
            remainingBalance : newRemainingBalance
        })

        // update status and remaing balance
        loan.remainingBalance = newRemainingBalance;
        loan.status = newStatus;

        await loan.save();

        return res.status(200).json({
            success :true,
            message : "laon payment added successgully"
        })

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}

export const deleteLoan = async (req , res) => {
    try {
        const {id} = req.params;
        
        const loan = await Loan.findById(id);
        if(!loan){
            return res.status(404).json({message : "loan not found to delete"})
        }

        await Loan.findByIdAndDelete(id);

        return res.status(200).json({
            success : true,
            message : "loan deleted succesfuly"
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}