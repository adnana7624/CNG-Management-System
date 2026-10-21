import mongoose from "mongoose";
import { Loan } from "../models/loanModel.js";
import { LoanOpeningBalance } from "../models/loanOpeningBlanceModel.js";

const LOAN_TYPES = [
    "loan_given",
    "loan_received",
    "loan_return",
    "loan_recovery",
];

const ORIGINAL_LOAN_TYPES = ["loan_given", "loan_received"];

const REPAYMENT_TYPES = ["loan_return", "loan_recovery"];

const PAYMENT_TYPES = ["cash", "bank transfer"];

const makeError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const parseDate = (value) => {
    if (!value) return null;

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed;
};

const roundAmount = (amount) =>
    Math.round((Number(amount) + Number.EPSILON) * 100) / 100;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


//CREATE LOAN / RECOVERY / RETURN

export const createLoan = async (req, res) => {
    const adminId = req.user.id;

    const { date, loanType, name, amount, paymentType } = req.body;

    try {
        const loanDate = parseDate(date);

        if (!loanDate) {
            throw makeError("A valid date is required");
        }

        if (!LOAN_TYPES.includes(loanType)) {
            throw makeError(
                "Loan type must be loan_given, loan_received, loan_return, or loan_recovery",
            );
        }

        if (typeof name !== "string" || !name.trim()) {
            throw makeError("Name is required");
        }

        const loanAmount = roundAmount(Number(amount));

        if (!Number.isFinite(loanAmount) || loanAmount <= 0) {
            throw makeError("Amount must be greater than zero");
        }

        if (!PAYMENT_TYPES.includes(paymentType)) {
            throw makeError("Payment type must be cash or bank transfer");
        }

        const cleanName = name.trim();

        if (ORIGINAL_LOAN_TYPES.includes(loanType)) {
            const loan = await Loan.create({
                admin: adminId,
                date: loanDate,
                loanType,
                name: cleanName,
                amount: loanAmount,
                remainingBalance: loanAmount,
                status: "active",
                paymentType,
                allocations: [],
                againstLoan: null,
            });

            return res.status(201).json({
                success: true,
                message: "Loan recorded successfully",
                loan,
            });
        }

        const originalLoanType =
            loanType === "loan_recovery" ? "loan_given" : "loan_received";

        let session;

        try {
            session = await mongoose.startSession();
            session.startTransaction();

            const nameRegex = new RegExp(`^${escapeRegex(cleanName)}$`, "i");

            const openingBalances = await LoanOpeningBalance.find({
                admin: adminId,
                name: {
                    $regex: nameRegex,
                },
                loanType: originalLoanType,
                status: "active",
                remainingBalance: {
                    $gt: 0,
                },
            })
                .sort({
                    targetMonth: 1,
                    createdAt: 1,
                    _id: 1,
                })
                .session(session);

            const originalLoans = await Loan.find({
                admin: adminId,

                name: {
                    $regex: nameRegex,
                },

                loanType: originalLoanType,
                status: "active",
                remainingBalance: {
                    $gt: 0,
                },
            })
                .sort({
                    date: 1,
                    createdAt: 1,
                    _id: 1,
                })
                .session(session);

            const openingTotal = roundAmount(
                openingBalances.reduce(
                    (total, item) => total + Number(item.remainingBalance || 0),
                    0,
                ),
            );

            const loanTotal = roundAmount(
                originalLoans.reduce(
                    (total, item) => total + Number(item.remainingBalance || 0),
                    0,
                ),
            );

            const totalOutstanding = roundAmount(openingTotal + loanTotal);

            if (totalOutstanding <= 0) {
                throw makeError(
                    `No outstanding ${originalLoanType.replace("_", " ")} found for this name`,
                    404,
                );
            }


            if (loanAmount > totalOutstanding) {
                throw makeError(
                    `Payment cannot be more than the remaining balance of ${totalOutstanding}`,
                );
            }

            /*
            |--------------------------------------------------------------------------
            | ALLOCATE PAYMENT
            |--------------------------------------------------------------------------
            */

            let amountLeft = loanAmount;

            const allocations = [];

            /*
            |--------------------------------------------------------------------------
            | FIRST: OPENING BALANCE
            |--------------------------------------------------------------------------
            */

            for (const opening of openingBalances) {
                if (amountLeft <= 0) {
                    break;
                }

                const available = roundAmount(opening.remainingBalance);

                const allocatedAmount = roundAmount(Math.min(available, amountLeft));

                if (allocatedAmount <= 0) {
                    continue;
                }

                opening.remainingBalance = roundAmount(available - allocatedAmount);

                opening.status = opening.remainingBalance === 0 ? "paid" : "active";

                await opening.save({
                    session,
                });

                allocations.push({
                    sourceType: "opening_balance",

                    sourceId: opening._id,

                    amount: allocatedAmount,
                });

                amountLeft = roundAmount(amountLeft - allocatedAmount);
            }

            //SECOND: NORMAL LOANS

            for (const loan of originalLoans) {
                if (amountLeft <= 0) {
                    break;
                }

                const available = roundAmount(loan.remainingBalance);

                const allocatedAmount = roundAmount(Math.min(available, amountLeft));

                if (allocatedAmount <= 0) {
                    continue;
                }

                loan.remainingBalance = roundAmount(available - allocatedAmount);

                loan.status = loan.remainingBalance === 0 ? "paid" : "active";

                await loan.save({
                    session,
                });

                allocations.push({
                    sourceType: "loan",

                    sourceId: loan._id,

                    amount: allocatedAmount,
                });

                amountLeft = roundAmount(amountLeft - allocatedAmount);
            }

            //SAFETY CHECK
            
            if (amountLeft > 0) {
                throw makeError("Unable to allocate the complete repayment");
            }

            //CREATE REPAYMENT RECORD
            

            const repayment = await Loan.create(
                [
                    {
                        admin: adminId,

                        date: loanDate,

                        loanType,

                        name:
                            openingBalances[0]?.name || originalLoans[0]?.name || cleanName,

                        amount: loanAmount,

                        paymentType,

                        againstLoan:
                            allocations.length === 1 && allocations[0].sourceType === "loan"
                                ? allocations[0].sourceId
                                : null,

                        allocations,

                        remainingBalance: 0,

                        status: "paid",
                    },
                ],
                {
                    session,
                },
            );

            await session.commitTransaction();

            return res.status(201).json({
                success: true,

                message:
                    loanType === "loan_recovery"
                        ? "Loan recovery recorded successfully"
                        : "Loan return recorded successfully",

                repayment: repayment[0],

                allocations,

                remainingOutstanding: roundAmount(totalOutstanding - loanAmount),
            });
        } catch (error) {
            if (session?.inTransaction()) {
                await session.abortTransaction();
            }

            throw error;
        } finally {
            if (session) {
                await session.endSession();
            }
        }
    } catch (error) {
        console.error("Create loan error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET ALL LOANS

export const getAllLoans = async (req, res) => {
    try {
        const adminId = req.user.id;

        const now = new Date();

        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        /*
            |--------------------------------------------------------------------------
            | NORMAL LOANS
            |--------------------------------------------------------------------------
            */

        const loans = await Loan.find({
            admin: adminId,
        })
            .sort({
                date: -1,
                createdAt: -1,
            })
            .lean();

        /*
            |--------------------------------------------------------------------------
            | OPENING BALANCES
            |--------------------------------------------------------------------------
            */

        const openingBalances = await LoanOpeningBalance.find({
            admin: adminId,
        })
            .sort({
                targetMonth: -1,
                createdAt: -1,
            })
            .lean();

        /*
            |--------------------------------------------------------------------------
            | CURRENT OUTSTANDING LOAN GIVEN
            |--------------------------------------------------------------------------
            */

        const openingLoanGiven = openingBalances.reduce((total, item) => {
            if (
                item.loanType === "loan_given" &&
                item.status === "active" &&
                Number(item.remainingBalance) > 0
            ) {
                return total + Number(item.remainingBalance || 0);
            }

            return total;
        }, 0);

        const normalLoanGiven = loans.reduce((total, loan) => {
            if (
                loan.loanType === "loan_given" &&
                loan.status === "active" &&
                Number(loan.remainingBalance) > 0
            ) {
                return total + Number(loan.remainingBalance || 0);
            }

            return total;
        }, 0);

        const totalLoanGiven = roundAmount(openingLoanGiven + normalLoanGiven);

            /*
            |--------------------------------------------------------------------------
            | CURRENT OUTSTANDING LOAN RECEIVED
            |--------------------------------------------------------------------------
            */

        const openingLoanReceived = openingBalances.reduce((total, item) => {
            if (
                item.loanType === "loan_received" &&
                item.status === "active" &&
                Number(item.remainingBalance) > 0
            ) {
                return total + Number(item.remainingBalance || 0);
            }

            return total;
        }, 0);

        const normalLoanReceived = loans.reduce((total, loan) => {
            if (
                loan.loanType === "loan_received" &&
                loan.status === "active" &&
                Number(loan.remainingBalance) > 0
            ) {
                return total + Number(loan.remainingBalance || 0);
            }

            return total;
        }, 0);

        const totalLoanReceived = roundAmount(
            openingLoanReceived + normalLoanReceived,
        );

        /*
            |--------------------------------------------------------------------------
            | THIS MONTH NEW LOAN GIVEN
            |--------------------------------------------------------------------------
            */

        const thisMonthLoanGiven = loans.reduce((total, loan) => {
            if (
                loan.loanType === "loan_given" &&
                loan.date >= startDate &&
                loan.date < endDate
            ) {
                return total + Number(loan.amount || 0);
            }

            return total;
        }, 0);

        /*
            |--------------------------------------------------------------------------
            | THIS MONTH NEW LOAN RECEIVED
            |--------------------------------------------------------------------------
            */

        const thisMonthLoanReceived = loans.reduce((total, loan) => {
            if (
                loan.loanType === "loan_received" &&
                loan.date >= startDate &&
                loan.date < endDate
            ) {
                return total + Number(loan.amount || 0);
            }

            return total;
        }, 0);

        /*
            |--------------------------------------------------------------------------
            | THIS MONTH RECOVERY
            |--------------------------------------------------------------------------
            */

        const thisMonthRecovery = loans.reduce((total, loan) => {
            if (
                loan.loanType === "loan_recovery" &&
                loan.date >= startDate &&
                loan.date < endDate
            ) {
                return total + Number(loan.amount || 0);
            }

            return total;
        }, 0);

        /*
            |--------------------------------------------------------------------------
            | THIS MONTH RETURN
            |--------------------------------------------------------------------------
            */

        const thisMonthReturn = loans.reduce((total, loan) => {
            if (
                loan.loanType === "loan_return" &&
                loan.date >= startDate &&
                loan.date < endDate
            ) {
                return total + Number(loan.amount || 0);
            }

            return total;
        }, 0);

        /*
            |--------------------------------------------------------------------------
            | ACTIVE NAMES
            |--------------------------------------------------------------------------
            */

        const activeLoanNames = new Set();

        /*
            | Opening balances
            */

        openingBalances.forEach((opening) => {
            if (opening.status === "active" && Number(opening.remainingBalance) > 0) {
                activeLoanNames.add(opening.name.trim().toLowerCase());
            }
        });

        /*
            | Normal original loans
            */

        loans.forEach((loan) => {
            if (
                ORIGINAL_LOAN_TYPES.includes(loan.loanType) &&
                loan.status === "active" &&
                Number(loan.remainingBalance) > 0
            ) {
                activeLoanNames.add(loan.name.trim().toLowerCase());
            }
        });

        /*
            |--------------------------------------------------------------------------
            | RESPONSE
            |--------------------------------------------------------------------------
            */

        return res.status(200).json({
            success: true,

            month: {
                year: now.getFullYear(),
                month: now.getMonth() + 1,
            },

            summary: {
                totalLoanGiven,
                totalLoanReceived,
                //openingLoanGiven: roundAmount(openingLoanGiven),
                //openingLoanReceived: roundAmount(openingLoanReceived),
                //thisMonthLoanGiven: roundAmount(thisMonthLoanGiven),
                //thisMonthLoanReceived: roundAmount(thisMonthLoanReceived),
                //thisMonthRecovery: roundAmount(thisMonthRecovery),
                //thisMonthReturn: roundAmount(thisMonthReturn),
                activeLoanStaff: activeLoanNames.size,
            },

            count: loans.length,

            loans,

            openingBalances,
        });
    } catch (error) {
        console.error("Get loans error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//CREATE LOAN OPENING BALANCE

export const createLoanOpeningBalance = async (req, res) => {
    try {
        const adminId = req.user.id;

        const { targetMonth, date, loanType, name, amount } = req.body;

        /*
            |--------------------------------------------------------------------------
            | VALIDATION
            |--------------------------------------------------------------------------
            */

        const targetMonthDate = parseDate(targetMonth);

        const openingDate = parseDate(date);

        if (!targetMonthDate) {
            return res.status(400).json({
                success: false,
                message: "A valid target month is required",
            });
        }

        if (!openingDate) {
            return res.status(400).json({
                success: false,
                message: "A valid date is required",
            });
        }

        if (!["loan_given", "loan_received"].includes(loanType)) {
            return res.status(400).json({
                success: false,
                message: "Loan type must be loan_given or loan_received",
            });
        }

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required",
            });
        }

        const numericAmount = roundAmount(Number(amount));

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than zero",
            });
        }

        /*
            |--------------------------------------------------------------------------
            | NORMALIZE TARGET MONTH
            |--------------------------------------------------------------------------
            */

        const normalizedMonth = new Date(
            targetMonthDate.getFullYear(),
            targetMonthDate.getMonth(),
            1,
        );

        /*
            |--------------------------------------------------------------------------
            | CHECK DUPLICATE
            |--------------------------------------------------------------------------
            |
            | Same admin + month + type + name
            |
            */

        const nameRegex = new RegExp(`^${escapeRegex(name.trim())}$`, "i");

        const existing = await LoanOpeningBalance.findOne({
            admin: adminId,

            targetMonth: normalizedMonth,

            loanType,

            name: {
                $regex: nameRegex,
            },
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message:
                    "Opening balance already exists for this name and loan type in this month",
            });
        }

        /*
            |--------------------------------------------------------------------------
            | CREATE
            |--------------------------------------------------------------------------
            */

        const openingBalance = await LoanOpeningBalance.create({
            admin: adminId,

            targetMonth: normalizedMonth,

            date: openingDate,

            loanType,

            name: name.trim(),

            amount: numericAmount,

            remainingBalance: numericAmount,

            status: "active",
        });

        return res.status(201).json({
            success: true,

            message: "Loan opening balance added successfully",

            openingBalance,
        });
    } catch (error) {
        console.error("Create loan opening balance error:", error);

        return res.status(500).json({
            success: false,

            message: error.message,
        });
    }
};

//GET LOAN OPENING BALANCES

export const getLoanOpeningBalances = async (req, res) => {
    try {
        const adminId = req.user.id;

        const { year, month } = req.query;

        const now = new Date();

        const selectedYear = Number(year) || now.getFullYear();

        const selectedMonth = Number(month) || now.getMonth() + 1;

        if (selectedMonth < 1 || selectedMonth > 12) {
            return res.status(400).json({
                success: false,
                message: "Month must be between 1 and 12",
            });
        }

        const targetMonth = new Date(selectedYear, selectedMonth - 1, 1);

        const openingBalances = await LoanOpeningBalance.find({
            admin: adminId,

            targetMonth,
        })
            .sort({
                loanType: 1,
                name: 1,
            })
            .lean();

        return res.status(200).json({
            success: true,

            month: {
                year: selectedYear,
                month: selectedMonth,
            },

            count: openingBalances.length,

            openingBalances,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,

            message: error.message,
        });
    }
};

// UPDATE ORIGINAL LOAN

export const updateLoan = async (req, res) => {
    try {
        const { id } = req.params;

        const adminId = req.user.id;

        const { date, name, amount, paymentType } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw makeError("Invalid loan ID");
        }

        const loan = await Loan.findOne({
            _id: id,

            admin: adminId,
        });

        if (!loan) {
            throw makeError("Loan not found", 404);
        }

        const loanDate = parseDate(date);

        if (!loanDate) {
            throw makeError("A valid date is required");
        }

        if (typeof name !== "string" || !name.trim()) {
            throw makeError("Name is required");
        }

        const newAmount = roundAmount(Number(amount));

        if (!Number.isFinite(newAmount) || newAmount <= 0) {
            throw makeError("Amount must be greater than zero");
        }

        if (!PAYMENT_TYPES.includes(paymentType)) {
            throw makeError("Payment type must be cash or bank transfer");
        }

        /*
            |--------------------------------------------------------------------------
            | CHECK REPAYMENT HISTORY
            |--------------------------------------------------------------------------
            */

        const linkedRepayments = await Loan.exists({
            admin: adminId,

            $or: [
                {
                    againstLoan: loan._id,
                },

                {
                    allocations: {
                        $elemMatch: {
                            sourceType: "loan",

                            sourceId: loan._id,
                        },
                    },
                },
            ],
        });

        const hasHistory =
            Boolean(linkedRepayments) ||
            (loan.transactions && loan.transactions.length > 0);

        
        /*
            |--------------------------------------------------------------------------
            | AMOUNT ALREADY RECOVERED / RETURNED
            |--------------------------------------------------------------------------
            */

        const alreadyPaid = roundAmount(
            Number(loan.amount) - Number(loan.remainingBalance),
        );

        if (newAmount < alreadyPaid) {
            throw makeError(
                "The new amount cannot be less than the amount already repaid",
            );
        }

        loan.date = loanDate;

        loan.name = name.trim();

        loan.amount = newAmount;

        loan.paymentType = paymentType;

        loan.remainingBalance = roundAmount(newAmount - alreadyPaid);

        loan.status = loan.remainingBalance === 0 ? "paid" : "active";

        await loan.save();

        return res.status(200).json({
            success: true,

            message: "Loan details updated successfully",

            loan,
        });
    } catch (error) {
        console.error("Update loan error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,

            message: error.message,
        });
    }
};

//DELETE LOAN / REPAYMENT

export const deleteLoan = async (req, res) => {
    const { id } = req.params;

    const adminId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,

            message: "Invalid loan ID",
        });
    }

    let session;

    try {
        session = await mongoose.startSession();

        session.startTransaction();

        const loan = await Loan.findOne({
            _id: id,

            admin: adminId,
        }).session(session);

        if (!loan) {
            throw makeError("Loan not found", 404);
        }

        /*
            |--------------------------------------------------------------------------
            | DELETE REPAYMENT
            |--------------------------------------------------------------------------
            */

        if (REPAYMENT_TYPES.includes(loan.loanType)) {
            let allocations = (loan.allocations || []).map((allocation) => ({
                sourceType: allocation.sourceType,

                sourceId: allocation.sourceId,

                amount: Number(allocation.amount),
            }));

            /*
                  |--------------------------------------------------------------------------
                  | BACKWARD COMPATIBILITY
                  |--------------------------------------------------------------------------
                  */

            if (allocations.length === 0 && loan.againstLoan) {
                allocations = [
                    {
                        sourceType: "loan",

                        sourceId: loan.againstLoan,

                        amount: Number(loan.amount),
                    },
                ];
            }

            if (allocations.length === 0) {
                throw makeError("This repayment has no allocation information", 409);
            }

            for (const allocation of allocations) {
                /*
                        | Restore normal loan
                        */

                if (allocation.sourceType === "loan") {
                    const originalLoan = await Loan.findOne({
                        _id: allocation.sourceId,

                        admin: adminId,
                    }).session(session);

                    if (!originalLoan) {
                        throw makeError(
                            "Original loan linked to repayment was not found",
                            409,
                        );
                    }

                    originalLoan.remainingBalance = roundAmount(
                        Math.min(
                            Number(originalLoan.amount),

                            Number(originalLoan.remainingBalance) + allocation.amount,
                        ),
                    );

                    originalLoan.status =
                        originalLoan.remainingBalance === 0 ? "paid" : "active";

                    await originalLoan.save({
                        session,
                    });
                }

                /*
                        | Restore opening balance
                        */

                if (allocation.sourceType === "opening_balance") {
                    const openingBalance = await LoanOpeningBalance.findOne({
                        _id: allocation.sourceId,

                        admin: adminId,
                    }).session(session);

                    if (!openingBalance) {
                        throw makeError(
                            "Opening balance linked to repayment was not found",
                            409,
                        );
                    }

                    openingBalance.remainingBalance = roundAmount(
                        Math.min(
                            Number(openingBalance.amount),

                            Number(openingBalance.remainingBalance) + allocation.amount,
                        ),
                    );

                    openingBalance.status =
                        openingBalance.remainingBalance === 0 ? "paid" : "active";

                    await openingBalance.save({
                        session,
                    });
                }
            }
        } else {
            const linkedRepayments = await Loan.countDocuments({
                admin: adminId,

                $or: [
                    {
                        againstLoan: loan._id,
                    },

                    {
                        allocations: {
                            $elemMatch: {
                                sourceType: "loan",

                                sourceId: loan._id,
                            },
                        },
                    },
                ],
            }).session(session);

            if (
                linkedRepayments > 0 ||
                (loan.transactions && loan.transactions.length > 0)
            ) {
                throw makeError(
                    "This loan has repayment history. Delete or correct its repayment records first.",
                );
            }
        }

        await Loan.deleteOne(
            {
                _id: loan._id,

                admin: adminId,
            },
            {
                session,
            },
        );

        await session.commitTransaction();

        return res.status(200).json({
            success: true,

            message: "Loan record deleted successfully",
        });
    } catch (error) {
        if (session?.inTransaction()) {
            await session.abortTransaction();
        }

        console.error("Delete loan error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,

            message: error.message,
        });
    } finally {
        if (session) {
            await session.endSession();
        }
    }
};
