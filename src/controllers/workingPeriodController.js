// import mongoose from "mongoose";

// import { WorkingPeriod } from "../models/workingPeriodModel.js";
// import {Sale} from "../models/saleModel.js";
// import {CasgBank} from "../models/cashBankModel.js";
// import { createWorkingPeriod } from "../scripts/workingPeriod.js";
// import { OpeningBalance } from "../models/openingBalanceModel.js";

// const getPeriodResponse = (period) =>({
//     id : period._id,
//     displayMonth : period.displayMonth,
//     displayYear : period.displayYear,
//     startedAt : period.startedAt,
//     cycleNumber : period.cycleNumber,
//     OpeningCashBalance : period.openingCashBalance,
//     openingBankBalance : period.openingBankBalance,
//     lastClosedAt : period.lastClosedAt
// })

// export const getWorkingPeriod = async(req , res) => {
//     try {
//         const period = await createWorkingPeriod(
//             req.user.id,
//             req.query.month,
//             req.query.year
//         )

//         return res.status(200).json({
//             success : true,
//             workingPeriod : getPeriodResponse(period)
//         })
//     } catch (error) {
//         return res.status(500).json({
//             success : false,
//             message : "unable to get working period"
//         })
//     }
// }

// export const closeWorkingPeriod = async(req , res) => {
//     try {
//         const adminId = req.user.id;

//         const period = await createWorkingPeriod(
//             adminId,
//             req.body?.month,
//             req.body?.year
//         );

//         const adminObjectId = new mongoose.Types.ObjectId(adminId);
//         const previousStart = period.startedAt;
//         const closedAt = new Date();


//     } catch (error) {
        
//     }
// }

import mongoose from "mongoose";

import { WorkingPeriod } from "../models/workingPeriodModel.js";
import { Sale } from "../models/saleModel.js";
import { CashBank } from "../models/cashBankModel.js";

import { createWorkingPeriod } from "../utils/workingPeriod.js";

const getPeriodResponse = (period) => ({
  id: period._id,
  displayMonth: period.displayMonth,
  displayYear: period.displayYear,
  startedAt: period.startedAt,
  cycleNumber: period.cycleNumber,
  openingCashBalance: period.openingCashBalance,
  openingBankBalance: period.openingBankBalance,
  lastClosedAt: period.lastClosedAt,
});

export const getWorkingPeriod = async (req, res) => {
  try {
    const period = await createWorkingPeriod(
      req.user.id,
      req.query.month,
      req.query.year
    );

    return res.status(200).json({
      success: true,
      workingPeriod: getPeriodResponse(period),
    });
  } catch (error) {
    console.error("Get working period error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to get working period",
    });
  }
};

export const closeWorkingPeriod = async (req, res) => {
  try {
    const adminId = req.user.id;

    const period = await createWorkingPeriod(
      adminId,
      req.body?.month,
      req.body?.year
    );

    const adminObjectId = new mongoose.Types.ObjectId(adminId);
    const previousStart = period.startedAt;
    const closedAt = new Date();

    // 1. Calculate completed sales created in this cycle.
    const salesTotals = await Sale.aggregate([
      {
        $match: {
          admin: adminObjectId,
          status: "completed",
          createdAt: { $gte: previousStart },
        },
      },
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const getSalesAmount = (paymentMethod) =>
      salesTotals.find(
        (item) => item._id === paymentMethod
      )?.total ?? 0;

    const cashSales = getSalesAmount("cash");
    const bankSales = getSalesAmount("bank transfer");

    // 2. Calculate transfers created in this cycle.
    const transferTotals = await CashBank.aggregate([
      {
        $match: {
          admin: adminObjectId,
          createdAt: { $gte: previousStart },
        },
      },
      {
        $group: {
          _id: "$transferType",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const getTransferAmount = (transferType) =>
      transferTotals.find(
        (item) => item._id === transferType
      )?.total ?? 0;

    const cashToBank = getTransferAmount("cash_to_bank");
    const bankToCash = getTransferAmount("bank_to_cash");

    // 3. Calculate closing balances using the established
    // Cash & Bank formula.
    const closingCashBalance =
      period.openingCashBalance +
      cashSales -
      cashToBank +
      bankToCash;

    const closingBankBalance =
      period.openingBankBalance +
      bankSales +
      cashToBank -
      bankToCash;

    // 4. Record the cycle that is being closed.
    period.history.push({
      cycleNumber: period.cycleNumber,
      startedAt: previousStart,
      closedAt,
      displayMonth: period.displayMonth,
      displayYear: period.displayYear,
      openingCashBalance: period.openingCashBalance,
      openingBankBalance: period.openingBankBalance,
      closingCashBalance,
      closingBankBalance,
    });

    // 5. Start a fresh cycle while keeping the same
    // displayed month and year.
    period.startedAt = closedAt;
    period.cycleNumber += 1;
    period.lastClosedAt = closedAt;

    // Carry forward the actual closing balances.
    period.openingCashBalance = closingCashBalance;
    period.openingBankBalance = closingBankBalance;

    await period.save();

    return res.status(200).json({
      success: true,
      message:
        "Working period closed successfully. Previous records remain saved.",
      workingPeriod: getPeriodResponse(period),
      closingBalances: {
        cash: closingCashBalance,
        bank: closingBankBalance,
      },
    });
  } catch (error) {
    console.error("Close working period error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to close working period",
    });
  }
};