
import { Sale } from "../models/saleModel.js";
import { CashBank } from "../models/cashBankModel.js";
import {OpeningBalance} from "..//models/openingBalanceModel.js";



// export const getCashBank = async (req ,res ) => {
//     try {
//         const adminId = new mongoose.Types.ObjectId(req.user.id);

//         // get current month and year
//         const currentDate = new Date();

//         const month = Number(currentDate.getMonth() + 1);
//         const year = Number(currentDate.getFullYear());


//         const startDate = new Date(year , month-1,1,0,0,0,0);
//         const endDate = new Date(year , month , 1 , 0,0,0,0);


//         // total cash sale
//         const cashSales = await Sale.aggregate([
//             {
//                 $match : {
//                     admin : adminId,
//                     status : "completed",
//                     paymentMethod : "cash",
//                     date : {
//                         $gte : startDate,
//                         $lt : endDate
//                     }
//                 }
//             },
//             {
//                 $group : {
//                     _id : null,
//                     total : {
//                         $sum : "$amount"
//                     }
//                 }
//             }
//         ]);

//         const totalCashSales = cashSales[0]?.total || 0;

//         // total bank sale 

//         const bankSales = await  Sale.aggregate([
//             {
//                 $match : {
//                     admin : adminId,
//                     status : "completed",
//                     paymentMethod : "bank transfer",
//                     date : {
//                         $gte : startDate,
//                         $lt : endDate
//                     }
//                 }
//             },
//             {
//                 $group : {
//                     _id : null,
//                     total : {
//                         $sum : "$amount"
//                     }
//                 }
//             }
//         ]);
//         const totalBankSales = bankSales[0]?.total || 0;

//         // toatl cash bank sank transfer
        
//         const transfers = await CashBank.aggregate([
//             {
//                 $match : {
//                     admin : adminId,
//                     date : {
//                         $gte : startDate,
//                         $lt : endDate
//                     }
//                 }
//             },
//             {
//                 $group : {
//                     _id : "$transferType",
//                     total : {
//                         $sum : "$amount"
//                     }
//                 }
//             }
//         ]);

//         let cashToBank = 0;
//         let bankToCash = 0;

//         transfers.forEach((transfer) => {
//             if(transfer._id === "cash_to_bank"){
//                 cashToBank = transfer.total
//             }
//             if(transfer._id === "bank_to_cash"){
//                 bankToCash = transfer.total
//             }
//         });

//         // calculte  total cash balance
//         const cashInHand = totalCashSales-cashToBank+bankToCash;

//         // calculate total bank baleance
//         const bankBalance = totalBankSales+cashToBank-bankToCash;

//         // get transaction history

//         const transactions = await CashBank.find({
//             admin : adminId,
//             date : {
//                 $gte : startDate,
//                 $lt : endDate
//             }
//         }).sort({date : -1 , createdAt : -1}).lean();

//         // format transaction for frontend

//         const formattedTransactions = transactions.map(
//             (transaction) => ({
//                 id : transaction._id,
//                 date : transaction.date,

//                 type : transaction.transferType === "cash_to_bank"?"Cash to Bank" : "Bank to Bank",

//                 transferType : transaction.transferType,
//                 amount : transaction.amount
//             })
//         )

//         return res.status(200).json({
//             success : true,
//             balance : {
//                 cashInHand,
//                 bankBalance
//             },
//             transactions
//         })

//     } catch (error) {
//         return res.status(500).json({
//             success : false,
//             message : error.message
//         })
//     }
// }

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


// export const createCashBankTransfer = async(req,res) =>{
//     try {
//         const adminId = new mongoose.Types.ObjectId(req.user.id);

//         const {date , transferType , amount} = req.body;

//         if(!date){
//             return res.status(400).json({message : "date is required"})
//         }

//         // validate  datew
//         const transferDate = new Date(date);
//         if(isNaN(transferDate.getTime())){
//             return res.status(400).json({
//                 success : false,
//                 message : "invaild date"
//             })
//         }

//         // validate transfertyepe
//     if(!["cash_to_bank","bank_to_cash"].includes(transferType)){
//         return res.status(400).json({message : "transfertupe must be bank_to_cash or cash_to_bank"})
//     }

//     // claidate amount
//     if(amount === undefined || amount === null  || Number(amount) <= 0){
//         return res.status(400).json({message : "amount must be greater than 0"})
//     }

//     const transferAmount = Number(amount)

//     // get current month
//     const transferYear = transferDate.getFullYear();
//     const transferMonth = transferDate.getMonth();
    
//     const startDate = new Date(transferYear,transferMonth, 1, 0, 0, 0, 0);
//     const endDate = new Date(transferYear,transferMonth+1 , 1, 0, 0, 0, 0);

//     const cashSale = await Sale.aggregate([
//         {
//             $match :{
//                 admin : adminId,
//                 status : "completed",
//                 paymentMethod : "cash",
//                 date: {
//                         $gte: startDate,
//                         $lt: endDate,
//                     }
//             }
//         },
//         {
//             $group :{
//                 _id : null,
//                 total :{
//                     $sum : "$amount"
//                 }
//             }
//         }
//     ]);

//     const totalCashSales = cashSale[0]?.total || 0;

//     // get total bank sale
//     const bankSale = await Sale.aggregate([
//         {
//             $match :{
//                 admin : adminId,
//                 status : "completed",
//                 paymentMethod : "bank transfer",
//                 date: {
//                         $gte: startDate,
//                         $lt: endDate,
//                     }
//             }
//         },
//         {
//             $group : {
//                 _id : null,
//                 total : {
//                     $sum : "$amount"
//                 }
//             }
//         }
//     ]);

//     const totalBankSales = bankSale[0]?.total || 0;

//     // get all prevous transfer
    
//     const transfers = await CashBank.aggregate([
//         {
//             $match :{
//                 admin : adminId,
//                 date: {
//                         $gte: startDate,
//                         $lt: endDate,
//                     },
//             }
//         },
//         {
//             $group:{
//                 _id : "$transferType",
//                 total : {
//                     $sum : "$amount"
//                 }
//             }
//         }
//     ]);

//     let cashToBank = 0;
//     let bankToCash = 0;
    
//     transfers.forEach((transfer) =>{
//         if(transfer._id === "cash_to_bank"){
//             cashToBank = transfer.total;
//         }
//         if(transfer._id === "bank_to_cash"){
//             bankToCash = transfer.total;
//         }
//     })

//     // current cash balance
//     const currentCash = totalCashSales - cashToBank + bankToCash;

//     // current nank balance

//     const currentBankBalance = totalBankSales +cashToBank - bankToCash;

//     // chechk availible cash

//     if(transferType === "cash_to_bank" && transferAmount > currentCash){
//         return res.status(400).json({
//             message : "insuffiecient balance",
//             availableCash : currentCash
//         })
//     }

//     // check avilble bank balancce

//     if(transferType === "bank_to_cash" && transferAmount > currentBankBalance){
//         return res.status(400).json({
//             success : false,
//             message : "insuficient bank balance ",
//             availableBankBalance : currentBankBalance
//         })
//     }

//     // create tranfer amount
//     const transfer = await CashBank.create({
//         admin : req.user.id,
//         date : transferDate,
//         transferType,
//         amount : transferAmount
//     })

//     // calculate new balance

//     let newCash = currentCash;
//     let newBank = currentBankBalance;

//     if(transferType === "cash_to_bank"){
//         newCash = currentCash - transferAmount;
//         newBank = currentBankBalance + transferAmount
//     }

//     if(transferType === "bank_to_cash"){
//         newBank = currentBankBalance - transferAmount;
//         newCash = currentCash + transferAmount
//     }

//     return res.status(201).json({
//         success : true,
//         message : "cash transfer completed succesfully",

//     })
// }
//     catch (error) {
//         return res.status(500).json({
//             success : false,
//             message : error.message
//         })
//     }
// }


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