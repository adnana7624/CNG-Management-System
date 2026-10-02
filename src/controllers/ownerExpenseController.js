import mongoose from "mongoose";
import { OwnerExpense } from "../models/ownerExpenseModel.js";
import {Owner} from "../models/ownerModel.js";

// const addOwner 
export const addOwner = async(req , res)=>{
    try {
        const adminId = req.user.id;

        const {ownerName} = req.body;

        if(!ownerName){
            return res.status(400).json({message : "onwername required"})
        }

        const owner = await Owner.create({
            admin : adminId,
            ownerName
        });

        return res.status(201).json({
            success : true,
            message : "owner added succwsfuly"
        })



    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}

export const getOwner = async(req , res)=>{
    try {
        const adminId = req.user.id;

        const owner = await Owner.find({admin : adminId});

        return res.status(200).json({
            success : true,
            owner
        })

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}


// Create Owner Expense
export const createOwnerExpense = async (req, res) => {
    try {
        const adminId = req.user.id;

        const {
            date,
            amount,
            paymentMode,
            owner,
            status,
            remarks,
        } = req.body;

        if (!date || amount === undefined || !paymentMode || !owner) {
            return res.status(400).json({
                success: false,
                message: "Date, amount, payment mode and owner are required",
            });
        }

        const ownerExpense = await OwnerExpense.create({
            admin: adminId,
            date,
            amount,
            paymentMode,
            owner,
            status,
            remarks,
        });

        return res.status(201).json({
            success: true,
            message: "Owner expense created successfully",
            ownerExpense,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Get All Owner Expenses
export const getOwnerExpenses = async (req, res) => {
    try {
        const adminId = req.user.id;

        const ownerExpenses = await OwnerExpense.find({
            admin: adminId,
        })
            .populate("owner")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: ownerExpenses.length,
            ownerExpenses,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Update Owner Expense
export const updateOwnerExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const adminId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid owner expense ID",
            });
        }

        const {
            date,
            amount,
            paymentMode,
            owner,
            status,
            remarks,
        } = req.body;

        if (!date || amount === undefined || !paymentMode || !owner) {
            return res.status(400).json({
                success: false,
                message: "Date, amount, payment mode and owner are required",
            });
        }

        const ownerExpense = await OwnerExpense.findOneAndUpdate(
            {
                _id: id,
                admin: adminId,
            },
            {
                date,
                amount,
                paymentMode,
                owner,
                status,
                remarks,
            },
            {
                new: true,
                runValidators: true,
            }
        ).populate("owner");

        if (!ownerExpense) {
            return res.status(404).json({
                success: false,
                message: "Owner expense not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Owner expense updated successfully",
            ownerExpense,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Delete Owner Expense
export const deleteOwnerExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const adminId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid owner expense ID",
            });
        }

        const ownerExpense = await OwnerExpense.findOneAndDelete({
            _id: id,
            admin: adminId,
        });

        if (!ownerExpense) {
            return res.status(404).json({
                success: false,
                message: "Owner expense not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Owner expense deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// get all owner details
export const getOwnerDatails = async(req , res ) => {
    try {
        const {OwnerId} = req.params
        const adminId = req.user.id;

        // get all epxense
        const ownerExpenses = await OwnerExpense.find({
            admin : adminId,
            owner : OwnerId
        }).populate("owner").sort({createdAt : -1});

        if(ownerExpenses.length === 0){
            return res.status(400).json({message : "no record for this owner"})
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(),now.getMonth(),1);
        const endOfMonth = new Date(now.getFullYear(),now.getMonth()+1,1);


        const totalExpensesToDate = ownerExpenses.reduce(
            (total,expense) => total+ Number(expense.amount),0
        );

        const currentMonthExpenses = ownerExpenses.filter((expense) => {
            const expenseDate = new Date(expense.date);
            
            return(
                expenseDate >= startOfMonth &&
                expenseDate < endOfMonth
            )
        }).reduce(
            (total , expense) => total + Number(expense.amount),0
        );

        const recentTransactions = ownerExpenses.slice(0,10).map((expense) => ({
            _id : expense._id,
            date : expense.date,
            category : expense.category,
            status : expense.status,
            descriptions : expense.remarks,
            paymentMode : expense.paymentMode,
            amount : expense.amount
        }))

        const owner = ownerExpenses[0].owner;
        
        return res.status(200).json({
            success : true,

            owner : {
                _id : owner._id,
                name : owner.name,
                role : owner.role
            },
            summary :{
                totalExpensesToDate,
                currentMonthExpenses
            },
            recentTransactions
        })

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}