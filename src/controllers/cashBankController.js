
import { Sale } from "../models/saleModel.js";
import { CashBank } from "../models/cashBankModel.js";
import {OpeningBalance} from "..//models/openingBalanceModel.js";





export const getCashBank = async (req , res) => {
    try {
        const adminId = req.user.id;

        // selected month
        const now = new Date();

        const year = Number(req.query.year) || now.getFullYear();

        const month = Number(req.query.month) || now.getMonth() +1;

        if(month < 1 || month > 12){
            return res.status(400).json({message : "month must between 1 and 12"})
        }

        const startOfMonth = new Date(year , month -1 , 1);
        const startOfNextMonth = new Date (year , month , 1);

        // get monthly sale 
        const sales = await Sale.find({
            admin : adminId,
            date : {
                $gte : startOfMonth,
                $lt : startOfNextMonth 
            },
            status : "completed"
        }).lean();

        // get monthly cash and bank transger
        const transfers = await CashBank.find({
            admin : adminId,
            date : {
                $gte : startOfMonth,
                $lt : startOfNextMonth
            }

        }).sort({
                date : -1 ,
                createdAt : -1
            }).lean();

        // get opening balance
        const openingBalances = await OpeningBalance.find({
            admin : adminId,
            targetMonth : startOfMonth
        }).lean();

        const openingCash = openingBalances.find(
            item => item.balanceType === "cash_in_hand"
        )?.amount || 0;

        const openingBank = openingBalances.find(
            item => item.balanceType === "cash_in_bank"
        )?.amount || 0;

        // calculate sales
        let cashSales = 0;
        let bankSales = 0;

        sales.forEach((sale) => {
            if(sale.paymentMethod === "cash"){
                cashSales += Number(sale.amount || 0)
            }
            if(sale.paymentMethod === "bank transfer"){
                bankSales += Number(sale.amount || 0)
            }
        });

        // calculate transfers
        let cashToBank = 0;
        let bankToCash = 0;

        transfers.forEach((transfer) => {
            if(transfer.transferType === "cash_to_bank"){
                cashToBank += Number(transfer.amount || 0);
            }
            if(transfer.transferType === "bank_to_cash"){
                bankToCash += Number(transfer.amount || 0)
            }
        });

        // final monthly balance
        const cashInHand = openingCash + cashSales - cashToBank + bankToCash;

        const bankBalance = openingBank + bankSales + cashToBank - bankToCash;
        

        return res.status(200).json({
            success : true,
            month : {
                year,
                month
            },
            openingBalances : {
                cashInHand : openingCash,
                bankBalance : openingBank
            },
            activity : {
                cashSales,
                bankSales,
                cashToBank,
                bankToCash
            },
            balance : {
                cashInHand,
                bankBalance
            },
            transactions : transfers
        })

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}



export const createCashBankTransfer = async(req , res ) => {
    try {
        const adminId = req.user.id;

        const {date , transferType , amount} = req.body;


        if(!date || !transferType || amount === undefined){
            return res.status(400).json({message : "all field are required"})
        }

        // validate transfer type 
        if(!["cash_to_bank" , "bank_to_cash"].includes(transferType)){
            return res.status(400).json({message : "transfer type must be cash to bank or bank to cash"})
        }

        // validate amount 
        const numericAmount = Number(amount);

        if(Number.isNaN(numericAmount) || numericAmount <= 0){
            return res.status(400).json({message : "amount must be grater than 0"})
        }

        // transfer date
        const transferDate = new Date(date);

        // get current month
        const year = transferDate.getFullYear();
        const month = transferDate.getMonth()+1;
        
        const startOfMonth = new Date(year , month-1 ,1);
        const startOfNextMonth = new Date(year , month , 1);

        // get opening balance
        const openingBalances = await OpeningBalance.find({
            admin : adminId,
            targetMonth : startOfMonth
        }).lean();

        const openingCash = openingBalances.find(
            item => item.balanceType === "cash_in_hand"
        )?.amount || 0;

        const openingBank = openingBalances.find(
            item => item.balanceType === "cash_in_bank"
        )?.amount || 0;

        // get monthly sales
        const sales = await Sale.find({
            admin : adminId,
            date : {
                $gte : startOfMonth,
                $lt : startOfNextMonth
            },
            status : "completed"
        }).lean();

        let cashSales = 0;
        let bankSales = 0;

        sales.forEach((sale) =>{
            if(sale.paymentMethod === "cash"){
                cashSales += Number(amount || 0);
            }
            if(sale.paymentMethod === "bank transfer"){
                bankSales += Number(amount || 0);

            }

        })

        // get monthly transfers
        const transfers = await CashBank.find({
            admin : adminId,
            date : {
                $gte : startOfMonth,
                $lt : startOfNextMonth
            },

        }).lean();

        let cashToBank = 0;
        let bankToCash = 0;

        transfers.forEach((transfer) =>{
            if(transfer.transferType === "cash_to_bank"){
                cashToBank += Number(transfer.amount || 0);

            }
            if(transfer.transferType === "bank_to_cash"){
                bankToCash += Number(transfer.amount || 0);

            }


        });

        // claculate current balance

        const currentCash = openingCash + cashSales - cashToBank + bankToCash;

        const currentBank = openingBank + bankSales + cashToBank - bankToCash;


        // chechk source balance
        if(transferType === "cash_to_bank" && numericAmount > currentCash){

            return res.status(400).json({
                success : false,
                message : "transfer amount cannot be more than availible cash",
                availableCah : currentCash
            })
        }

        if(transferType === "bank_to_cash" && numericAmount > currentBank){
            return res.status(400).json({
                success : false,
                message : "transfer amount cannot be more than available bank balaence",
                availableBankBalance : currentBank
            })
        }
        
        const transfer = await CashBank.create({
            admin : adminId,
            date : transferDate,
            amount : numericAmount,
            transferType
        })

        // calculate new balance
        let newCash = currentCash;
        let newBank = currentBank;

        if(transferType === "cash_to_bank"){
            newCash -= numericAmount;
            newBank += numericAmount;
        }
        if(transferType === "bank_to_cash"){
            newCash += numericAmount;
            newBank -= numericAmount;
        }

        return res.status(201).json({
            success : true,
            message : "transfer amount record successfully",
            transfer : {
                id : transfer._id,
                date : transfer.date,
                transferType : transfer.transferType,
                amount : transfer.amount
            },
            balance :{
                cashInHand : newCash,
                bankBalance : newBank
            }
        });


    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}


export const deleteCashBankTransfer = async(req , res) => {
    try {
        const {id} = req.params;

        const tranfer = await CashBank.findById(id)
        if(!tranfer){
            return res.status(400).json({
                success : true,
                message : "cashBank transfer not found"
            })
        }

        await CashBank.findByIdAndDelete(id);

        return res.status(200).json({message : "transaction deleted successfully"});
        
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}



export const createOpeningBalnce = async(req , res) =>{
    try {
        const adminId = req.user.id;

        const {balanceType , targetMonth , date ,amount } = req.body;

        if(!balanceType || !targetMonth || !date || !amount){
            return res.status(400).json({message : "all field are required"})
        }

        // calidate amout
        const numericAmount = Number(amount);

        if(Number.isNaN(numericAmount) || numericAmount < 0){
            return res.status(400).josn({message : "amount must be a valid number"})
        }

        
        const targetMonthDate = new Date(targetMonth);
        const effectiveDateValue = new Date(date);

        if(Number.isNaN(targetMonthDate.getTime()) || Number.isNaN(effectiveDateValue.getTime())){
            return res.status(400).json({message : "invalid date"})
        }

        const normalizeDate = new Date(targetMonthDate.getFullYear(),targetMonthDate.getMonth(),1);

        // check existing balance for this monht
        const existingBalance = await OpeningBalance.findOne({
            admin : adminId,
            targetMonth : normalizeDate,
            balanceType
        })

        if(existingBalance){
            return res.status(400).json({message : "opening balance already exist for this month"})
        }

        const openingBalance = await OpeningBalance.create({
            admin : adminId,
            balanceType,
            targetMonth : normalizeDate,
            date,
            amount : numericAmount
        })

        return res.status(201).json({
            success : true,
            message : "opening balnace add successfully",
            openingBalance
        })

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}