import mongoose from "mongoose";
import { Sale } from "../models/saleModel.js";
import { CashBank } from "../models/cashBankModel.js";

export const getCashBank = async (req ,res ) => {
    try {
        const adminId = new mongoose.Types.ObjectId(req.user.id);

        // get current month and year
        const currentDate = new Date();

        const month = Number(currentDate.getMonth() + 1);
        const year = Number(currentDate.getFullYear());


        const startDate = new Date(year , month-1,1,0,0,0,0);
        const endDate = new Date(year , month , 1 , 0,0,0,0);


        // total cash sale
        const cashSales = await Sale.aggregate([
            {
                $match : {
                    admin : adminId,
                    status : "completed",
                    paymentMethod : "cash",
                    date : {
                        $gte : startDate,
                        $lt : endDate
                    }
                }
            },
            {
                $group : {
                    _id : null,
                    total : {
                        $sum : "$amount"
                    }
                }
            }
        ]);

        const totalCashSales = cashSales[0]?.total || 0;

        // total bank sale 

        const bankSales = await  Sale.aggregate([
            {
                $match : {
                    admin : adminId,
                    status : "completed",
                    paymentMethod : "bank transfer",
                    date : {
                        $gte : startDate,
                        $lt : endDate
                    }
                }
            },
            {
                $group : {
                    _id : null,
                    total : {
                        $sum : "$amount"
                    }
                }
            }
        ]);
        const totalBankSales = bankSales[0]?.total || 0;

        // toatl cash bank sank transfer
        
        const transfers = await CashBank.aggregate([
            {
                $match : {
                    admin : adminId,
                    date : {
                        $gte : startDate,
                        $lt : endDate
                    }
                }
            },
            {
                $group : {
                    _id : "$transferType",
                    total : {
                        $sum : "$amount"
                    }
                }
            }
        ]);

        let cashToBank = 0;
        let bankToCash = 0;

        transfers.forEach((transfer) => {
            if(transfer._id === "cash_to_bank"){
                cashToBank = transfer.total
            }
            if(transfer._id === "bank_to_cash"){
                bankToCash = transfer.total
            }
        });

        // calculte  total cash balance
        const cashInHand = totalCashSales-cashToBank+bankToCash;

        // calculate total bank baleance
        const bankBalance = totalBankSales+cashToBank-bankToCash;

        // get transaction history

        const transactions = await CashBank.find({
            admin : adminId,
            date : {
                $gte : startDate,
                $lt : endDate
            }
        }).sort({date : -1 , createdAt : -1}).lean();

        // format transaction for frontend

        const formattedTransactions = transactions.map(
            (transaction) => ({
                id : transaction._id,
                date : transaction.date,

                type : transaction.transferType === "cash_to_bank"?"Cash to Bank" : "Bank to Bank",

                transferType : transaction.transferType,
                amount : transaction.amount
            })
        )

        return res.status(200).json({
            success : true,
            balance : {
                cashInHand,
                bankBalance
            },
            transactions
        })

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}

export const createCashBankTransfer = async(req,res) =>{
    try {
        const adminId = new mongoose.Types.ObjectId(req.user.id);

        const {date , transferType , amount} = req.body;

        if(!date){
            return res.status(400).json({message : "date is required"})
        }

        // validate  datew
        const transferDate = new Date(date);
        if(isNaN(transferDate.getTime())){
            return res.status(400).json({
                success : false,
                message : "invaild date"
            })
        }

        // validate transfertyepe
    if(!["cash_to_bank","bank_to_cash"].includes(transferType)){
        return res.status(400).json({message : "transfertupe must be bank_to_cash or cash_to_bank"})
    }

    // claidate amount
    if(amount === undefined || amount === null  || Number(amount) <= 0){
        return res.status(400).json({message : "amount must be greater than 0"})
    }

    const transferAmount = Number(amount)

    // get current month
    const transferYear = transferDate.getFullYear();
    const transferMonth = transferDate.getMonth();
    
    const startDate = new Date(transferYear,transferMonth, 1, 0, 0, 0, 0);
    const endDate = new Date(transferYear,transferMonth+1 , 1, 0, 0, 0, 0);

    const cashSale = await Sale.aggregate([
        {
            $match :{
                admin : adminId,
                status : "completed",
                paymentMethod : "cash",
                date: {
                        $gte: startDate,
                        $lt: endDate,
                    }
            }
        },
        {
            $group :{
                _id : null,
                total :{
                    $sum : "$amount"
                }
            }
        }
    ]);

    const totalCashSales = cashSale[0]?.total || 0;

    // get total bank sale
    const bankSale = await Sale.aggregate([
        {
            $match :{
                admin : adminId,
                status : "completed",
                paymentMethod : "bank transfer",
                date: {
                        $gte: startDate,
                        $lt: endDate,
                    }
            }
        },
        {
            $group : {
                _id : null,
                total : {
                    $sum : "$amount"
                }
            }
        }
    ]);

    const totalBankSales = bankSale[0]?.total || 0;

    // get all prevous transfer
    
    const transfers = await CashBank.aggregate([
        {
            $match :{
                admin : adminId,
                date: {
                        $gte: startDate,
                        $lt: endDate,
                    },
            }
        },
        {
            $group:{
                _id : "$transferType",
                total : {
                    $sum : "$amount"
                }
            }
        }
    ]);

    let cashToBank = 0;
    let bankToCash = 0;
    
    transfers.forEach((transfer) =>{
        if(transfer._id === "cash_to_bank"){
            cashToBank = transfer.total;
        }
        if(transfer._id === "bank_to_cash"){
            bankToCash = transfer.total;
        }
    })

    // current cash balance
    const currentCash = totalCashSales - cashToBank + bankToCash;

    // current nank balance

    const currentBankBalance = totalBankSales +cashToBank - bankToCash;

    // chechk availible cash

    if(transferType === "cash_to_bank" && transferAmount > currentCash){
        return res.status(400).json({
            message : "insuffiecient balance",
            availableCash : currentCash
        })
    }

    // check avilble bank balancce

    if(transferType === "bank_to_cash" && transferAmount > currentBankBalance){
        return res.status(400).json({
            success : false,
            message : "insuficient bank balance ",
            availableBankBalance : currentBankBalance
        })
    }

    // create tranfer amount
    const transfer = await CashBank.create({
        admin : req.user.id,
        date : transferDate,
        transferType,
        amount : transferAmount
    })

    // calculate new balance

    let newCash = currentCash;
    let newBank = currentBankBalance;

    if(transferType === "cash_to_bank"){
        newCash = currentCash - transferAmount;
        newBank = currentBankBalance + transferAmount
    }

    if(transferType === "bank_to_cash"){
        newBank = currentBankBalance - transferAmount;
        newCash = currentCash + transferAmount
    }

    return res.status(201).json({
        success : true,
        message : "cash transfer completed succesfully",

    })
}
    catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}