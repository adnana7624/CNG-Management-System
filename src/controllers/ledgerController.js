import {Sale} from "../models/saleModel.js";
import {Loan} from "../models/loanModel.js";
import {CashBank} from "../models/cashBankModel.js";
import { Expense } from "../models/expenseModel.js";
import { RecoveryExpense} from "../models/recoveryExpenseModel.js";
import { DieselExpense } from "../models/dieselExpenseModel.js";
import { OwnerExpense } from "../models/ownerExpenseModel.js";
import { ExpenseCategory } from "../models/expenseCategoryModel.js";
import { Admin } from "../models/adminModel.js";


export const getLedger = async(req , res) => {
    try {
        const admin = await Admin.findById(req.user.id).select("adminName");
        // console.log("loggedIn Admin : ",admin?.adminName)

        const adminId = req.user.id;

        const page = Math.max(Number(req.query.page) || 1 , 1);

        const limit = Math.min(Math.max(Number(req.query.limit) || 5 , 1));

        const skip = (page -1) * limit;

        const [
            sales ,
            loans ,
            cashBankTransfers ,
            expenses ,
            recoveryExpenses ,
            dieselExpenses,
            ownerExpenses
        ] = await Promise.all([
            Sale.find({admin : adminId}).sort({date : -1 , createdAt :-1}).lean(),
            Loan.find({admin : adminId}).sort({date : -1 , createdAt : -1}).lean(),
            CashBank.find({admin:adminId}).sort({date : -1 , createdAt : -1}).lean(),
            Expense.find({admin : adminId}).populate("category","name").sort({date : -1 , createdAt : -1}).lean(),
            RecoveryExpense.find({admin :adminId}).populate("category","name").sort({date : -1 , createdAt : -1}).lean(),
            DieselExpense.find({admin:adminId}).sort({date : -1 , createdAt : -1}).lean(),
            OwnerExpense.find({admin : adminId}).sort({date : -1 , createdAt : -1}).lean(),

        ]);
        
        const ledger = [];

        // Sales
        sales.forEach((sale) =>{
            if(sale.status !== "completed"){
                return;
            }
            ledger.push({
                id : sale._id,
                source : "sale",
                date : sale.date,
                type : "Sale",
                specificHead : "CNG Sales Revenue",
                details : sale.notes || "CNG Sale",
                amount : sale.amount,
                paymentPool : sale.paymentMethod === "cash"?"Cash Acount Head Pool":"Bank Acount Reserve Pool",
                volume : sale.volume,
                status : sale.status
            });
        });

        // Normal Expenses
        expenses.forEach((expense) =>{
            ledger.push({
                id : expense._id,
                source : "expense",
                date :  expense.date,
                type : "Expense",
                specificHead : expense.category?.name || "",
                details : expense.remarks || "",
                amount : expense.amount,
                paymentPool : expense.paymentMode,
                volume : null,
                status : expense.status
            })
        });
        
        // Recovery Expenses
        recoveryExpenses.forEach((expense) =>{
            ledger.push({
                id : expense._id,
                source : "recovery Expense",
                date : expense.date,
                type : "Recovery Expense",
                specificHead : expense.category?.name || "Expense Recovery",
                details : expense.remarks || "Recovered Expense Amount ",
                amount : expense.recoveryAmount,
                paymentPool : expense.paymentMode,
                volume : null,
                status : "completed"
            })
        });

        // Diesel Expenses
        dieselExpenses.forEach((expense) =>{
            ledger.push({
                id : expense._id,
                source : "diesel expense",
                date : expense.date,
                type : "Expense",
                specificHead : "Diesel Purchased",
                details : expense.remarks || "Diesel Purchase",
                paymentPool : "Cash Acount Hand Pool",
                volume : null ,
                dieselQuantity : expense.dieselQuantity,
                status : "completed"
            })
        });

        // Owner Expense
        ownerExpenses.forEach((expense) =>{
            ledger.push({
                id : expense._id,
                source : "owner_expense",
                date : expense.date,
                type : "Expense",
                specificHead : "Owner Expense",
                details : expense.remarks || "owner WithDrawl",
                amount : expense.amount,
                paymentPool : expense.paymentMode,
                volume : null,
                status : expense.status || ""
            })
        });

        // Loans
        loans.forEach((loan) =>{
            ledger.push({
                id : `${loan._id}-original`,
                source : "loan",
                date : loan.date,
                type : "Loan",
                specificHead : loan.loanType === "loan_given"?"loan_given":"Loan Recieved",
                details : loan.remarks || loan.name,
                amount : loan.amount,
                paymentPool : loan.paymentType,
                volume : null,
                status : loan.status
            })

            // loan update transaction
            if(loan.transactions && loan.transactions.length > 0){
                loan.transactions.forEach((transaction , index) => {
                    ledger.push({
                        id : `${loan._id}-transaction-${index}`,
                        source : "loan",
                        date : transaction.date,
                        type : "Loan",
                        specificHead : transaction.loanType === "loan_given"?"Loan Given" : "Loan Received",
                        details:transaction.remarks || loan.name,
                        amount : transaction.amount,
                        paymentPool : transaction.paymentType,
                        volume : null,
                        status : loan.status
                    })
                });
                }
        });
            // CashBank Transfer
        cashBankTransfers.forEach((transfer) =>{
            const isCashToBank = transfer.transferType === "cash_to_bank"
            ledger.push({
                id : transfer._id,
                source : "cash_bank",
                date : transfer.date,
                type : "Cash Transfer",
                specificHead : isCashToBank?"Cash To Bank " : "Bank To Cash",
                details : isCashToBank?"Transfer To Bank " : "Transfer To Cash",
                amount : transfer.amount,
                paymentPool : isCashToBank?"Bank Acount Reserve Pool" : "Cash Acount Hand Pool",
                volume : null,
                status : "completed"
            })
        })

        //sort by date 
        ledger.sort((a,b) =>{
            const dateDifference = new Date(b.date) - new Date(a.date);
            if(dateDifference !==0){
                return dateDifference;
                }
                return 0;
        })
        // count 
        const total = ledger.length;

        const totalPages = Math.ceil(total/limit);

        // pagination
        const paginatedLedger = ledger.slice(
            skip,
            skip+limit
        );

        return res.status(200).json({
            success : true,
            admin:{
                name : admin.adminName
            },
            pagination : {
            page,
            limit,
            total,
            totalPages
            },
            transaction : paginatedLedger
        })

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}