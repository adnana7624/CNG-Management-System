import { WorkingPeriod } from "../models/workingPeriodModel.js";
import {OpeningBalance} from "../models/openingBalanceModel.js";

export const createWorkingPeriod = async(
    adminId,
    requestedMonth,
    requestedYear
) => {
    let period = await WorkingPeriod.findOne({
        admin : adminId
    });

    if(period){
        return period
    }

    const now = new Date();
    
    const month = Number(requestedMonth || now.getMonth()+1);
    const year = Number(requestedYear) || now.getFullYear();

    const startOfMonth = new Date(year , month -1 , 1);
    const startOfNextMonth = new Date(year , month , 1);

    // prevent opening balcne alrady enter for htis month 

    const OpeningBalances = await OpeningBalance.find({
        admin : adminId,
        targetMonth : {
            $gte : startOfMonth,
            $lt : startOfNextMonth
        }
    }).select("balanceType amount")

    const openingCashBalance = OpeningBalance.find(
        (item) => item.balanceType === "cash_in_hand"
    )?.amount??0;

    const openingBankBalance = OpeningBalance.find(
        (item) => item.balanceType === "cash_in_bank"
    )?.amount??0;
    

    try {
        period = await WorkingPeriod.create({
            admin : adminId,
            displayMonth : month,
            displayYear : year,

            // use start of selected month
            startedAt : startOfMonth,

            cycleNumber :1,
            openingCashBalance,
            openingBankBalance
        })
        return period;

    } catch (error) {
        // protect creating two initail request
        if(error.code === 11000){
            period = await WorkingPeriod.findOne({
                admin : adminId
            })
            if(period){
                return period
            }
        }
        throw error;
    }
}