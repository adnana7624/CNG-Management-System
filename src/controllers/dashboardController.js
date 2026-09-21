import { Admin } from "../models/adminModel.js";
import { CashBank } from "../models/cashBankModel.js";
import { DieselExpense } from "../models/dieselExpenseModel.js";
import { Expense } from "../models/expenseModel.js";
import { Loan } from "../models/loanModel.js";
import { OwnerExpense } from "../models/ownerExpenseModel.js";
import { RecoveryExpense } from "../models/recoveryExpenseModel.js";
import { Sale } from "../models/saleModel.js";

export const getDashboard = async (req , res) =>{
    try {
        const adminId = req.user.id;
        const admin = await Admin.findById(adminId).select("adminName pumpName pumpAddress role status");
        if(!admin){
            return res.status(404).json({message : "admin not found"})
        }

        // filter month
        const now = new Date();
        
        const year = Number(req.query.year) || now.getFullYear();
        const month = Number(req.query.month) || now.getMonth()+1;

        const startOfMonth = new Date(year , month-1 ,1);
        const startOfNextMonth = new Date(year , month , 1);

        // daily date
        const selectedDate = req.query.date?new Date(req.query.date):new Date();

        if(isNaN(selectedDate.getTime())){
            return res.status(400).json({message : "invalid date fromat use yyyy-mm-dd"})
        }

        const startOfDay = new Date(selectedDate.getFullYear(),selectedDate.getMonth(),selectedDate.getDate());
        const endOfDay = new Date(selectedDate.getFullYear(),selectedDate.getMonth(),selectedDate.getDate()+1);

        // fecth data 
        const [
            monthlySales,
            dailySales,
            monthlyDiesel,
            monthlyExpenses,
            monthlyOwnerExpenses,
            loans,
            recentSales,
            recentExpense,
            recentRecoveryExpenses,
            recentDieselExpenses,
            recentOwnerExpenses,
            recentLoans,
            recentCashBank
        ] = await Promise.all([
            // monthly sale
            Sale.find({
                admin : adminId,
                date : {
                    $gte : startOfMonth,
                    $lt : startOfNextMonth
                },
                status : "completed"
            }).lean(),
            
            // daily sale
            Sale.find({
                admin : adminId,
                date :{
                    $gte : startOfDay,
                    $lt : endOfDay
                },
                status : "completed"
            }).lean(),

            //monthle diesel
            DieselExpense.find({
                admin : adminId,
                date :{
                    $gte : startOfMonth,
                    $lt : startOfNextMonth 
                }
            }).lean(),

            //monthly normal sale
            Expense.find({
                admin : adminId,
                date :{
                    $gte : startOfMonth,
                    $lt : startOfNextMonth
                },
                status : {$in : ["Paid","paid","Completed","completed"]}
            }).populate("category","name").lean(),

            // monthly owner expense
            OwnerExpense.find({
                admin : adminId,
                date : {
                    $gte : startOfMonth,
                    $lt : startOfNextMonth
                },
                status : {$in: ["Paid","paid","Completed","completed"]}
            }).lean(),

            // all loan
            Loan.find({
                admin : adminId,

            }).lean(),

            // recent Sale
            Sale.find({admin:adminId})
            .sort({date : -1, createdAt : -1}).limit(5).lean(),

            // recient expense
            Expense.find({
                admin :adminId,
            }).populate("category","name").sort({date : -1 , createdAt : -1}).limit(5).lean(),

            // recoent recorvy expense
            RecoveryExpense.find({
                admin : adminId
            }).populate("category","name").sort({date:-1,createdAt :-1}).limit(5).lean(),


            // recent diesel

            DieselExpense.find({
                admin:adminId
            }).sort({date : -1 , createdAt : -1}).limit(5).lean(),

            // recent owner expense
            OwnerExpense.find({
                admin : adminId
            }).sort({date : -1 , createdAt : -1}).limit(5).lean(),

            // recent loan

            Loan.find({
                admin : adminId
            }).sort({date : -1 , createdAt : -1}).limit(5).lean(),

            // Recent cash bank
            CashBank.find({
                admin : adminId
            }).sort({date : -1 , createdAt : -1}).limit(5).lean(),

        ]);

        // Toatal sale
        const totalSale = monthlySales.reduce(
            (total , sale) => total + Number(sale.amount || 0 ),0
        );

        // Total KG
        const totalKg = monthlySales.reduce(
            (total , sale) => total + Number(sale.cngVolume || 0),0
        );

        // daily sale
        const dailySaleAmount = dailySales.reduce(
            (total , sale) => total + Number(sale.amount || 0),0
        );

        //  daily sale kg
        const dailySaleKg = dailySales.reduce(
            (total , sale) => total + Number(sale.cngVolume || 0),0
        )

        // diesel purchased 
        const dieselAmount = monthlyDiesel.reduce(
            (total , diesel) => total + Number(diesel.amount || 0) , 0
        )

        const dieselLiters = monthlyDiesel.reduce(
            (total , diesel) => total + Number(diesel.dieselQuantity || 0),0
        )

        // loan to other
        const loanToOthers = loans.filter(
            loan => loan.loanType === "loan_given" && loan.status === "active"
            ).reduce((total , loan)=>total + Number(loan.remainingBalance || 0 ),0
        );

        // loan from other
        const loanFromOthers = loans.filter(
            loan => loan.loanType === "loan_received" && loan.status === "active"
        ).reduce(
            (total , loan) => total + Number(loan.remainingBalance || 0),0
        )

        // total expense
        const totalExpenses = monthlyExpenses.reduce(
            (total , expense) => total+Number(expense.amount || 0),0
        );

        // owner expesne
        const ownerExpense = monthlyOwnerExpenses.reduce(
            (total , expense) => total + Number(expense.amount || 0),0
        );


        // recent transaction

        const recentTransactions = [];
        // sales
        recentSales.forEach((sale) => {
            if(sale.status !== "completed") return;

            recentTransactions.push({
                id : sale._id,
                date : sale.date,
                type : "Sale",
                details : sale.notes || "CNG Sale",
                amount : sale.amount,
                pool : sale.paymentMethod === "cash"?"Cash":"Bank",
                status : "completed"
            })
        });

        // Expense
        recentExpense.forEach((expense) => {
            recentTransactions.push({
                id : expense._id,
                date : expense.date,
                type : "Expense",
                details : expense.category?.name || expense.remarks || "Expenses",
                amount : expense.amount,
                pool : expense.paymentMode,
                status : expense.status || "completed"
            })
        });

        // recovery expense
        recentRecoveryExpenses.forEach((expense) =>{
            recentTransactions.push({
                id : expense._id,
                date : expense.date,
                type : "Expense Recovery",
                details : expense.category.name || expense.remarks || "Recovered Expense",
                amount : expense.recoveryAmount ,
                pool : expense.paymentMode,
                status : expense.status || "Completed"
            })
        });

        // diesel 
        recentDieselExpenses.forEach((diesel) =>{
            recentTransactions.push({
                id : diesel._id,
                date : diesel.date,
                type : "Diesel",
                details : diesel.remarks || "Diesel Purchase",
                amount : diesel.amount ,
                pool : "Cash",
                quantity : diesel.dieselQuantity,
                status : "Completed"
            })
        });

        // owner expenses
        recentOwnerExpenses.forEach((expense) =>{
            recentTransactions.push({
                id : expense._id,
                date : expense.date,
                type : "Owner Expense ",
                details :  expense.remarks || "Owner Withdrawl",
                amount : expense.amount ,
                pool : expense.paymentMode,
                status : expense.status || "Completed"
            })
        });

        // loans
        recentLoans.forEach((loan) =>{
            // original loan
            recentTransactions.push({
                id : `${loan._id} - Original Loan`,
                date : loan.date,
                type : "Loan",
                details : loan.remarks || loan.name,
                amount : loan.amount ,
                pool : loan.paymentType,
                status : loan.status || "Completed",
                loanType : loan.loanType
            });

            // laon transaction loan type
            if(loan.transactions && loan.transactions.length > 0){
                loan.transactions.forEach((transaction , index) => {
                    recentTransactions.push({
                        id : `${loan._id} -transaction-${index}`,
                        date : transaction.date,
                        type : transaction.loanType === "loan_received"?"Loan Recovery":"Loan Payment",
                        details : transaction.remarks || loan.name,
                        amount : transaction.amount,
                        pool : transaction.paymentType,
                        status : loan.status,
                        loanType : transaction.loanType
                    })
                })
            }
        });

        // cash / bank transfers
        recentCashBank.forEach((transfer) => {
            const cashToBank = transfer.transferType ==="cash_to_bank";
        
            recentTransactions.push({
                id : transfer._id,
                date : transfer.date,
                type : "Transfer",
                details : cashToBank?"Cash To Bank":"Bank To Cash",
                amount : transfer.amount,
                pool : cashToBank?"Bank":"Cash",
                status : "Completed"

            })
        });

        // sort newest first 
        recentTransactions.sort((a , b) => 
            new Date(b.date) - new Date(a.date)
        );

        // show only latest 5
        const latestTransactions = recentTransactions.slice(0,5);


        return res.status(200).json({
            success : true,
            admin:{
                id : admin._id,
                name : admin.adminName,
                pumpName : admin.pumpName,
                pumpAddress : admin.pumpAddress,
                role : admin.role,
                status : admin.status
            },
            filter :{
                month,
                year,
                date : startOfDay
            },
            dashboard : {
                totalSale,
                totalKg,
                dailySale : {
                    amount : dailySaleAmount,
                    kg : dailySaleKg
                },
                dieselPurchased :{
                    amount : dieselAmount,
                    liters : dieselLiters
                },
                loanToOthers,
                loanFromOthers,
                totalExpenses,
                ownerExpense
            },

            recentTransactions : latestTransactions
        });


    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}