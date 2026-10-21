// import mongoose from "mongoose";


// const loanTransactionSchema = new mongoose.Schema({
//     date: {
//         type: Date,
//         required: true,
//         },

//     loanType: {
//         type: String,
//         enum: ["loan_given", "loan_received"],
//         required: true,
//         },

//     amount: {
//         type: Number,
//         required: true,
//         min: 0,
//         },

//     paymentType: {
//         type: String,
//         enum: ["cash", "bank transfer"],
//         required: true,
//         }
//     },
//     {
//         _id: false,
//     }
// );

// const loanschema = new mongoose.Schema({
//     admin : {
//         type : mongoose.Schema.Types.ObjectId,
//         ref : "Admin",
//         required : true
//     },
//     date :{
//         type : Date,
//         required : true
//     },
//     loanType : {
//         type : String,
//         enum : ["loan_given","loan_received"],
//         required : true
//     },
//     name : {
//         type : String,
//         required : true,
//         trim : true
//     },
//     amount : {
//         type : Number,
//         required : true,
//         min : 0
//     },
//     status : {
//         type : String,
//         enum : ["active","paid"],
//         default : "active"
//     },
//     paymentType : {
//         type : String,
//         enum : ["cash" , "bank transfer"],
//         required : true
//     },
//     remainingBalance : {
//         type : Number,
//         required : true,
//         min : 0
//     },
//     transactions: {
//         type: [loanTransactionSchema],
//         default: [],
//     }
    
// },{timestamps : true})

// export const Loan = mongoose.model("Loan",loanschema);


import mongoose from "mongoose";


const loanTransactionSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
        },

        loanType: {
            type: String,
            enum: [
                "loan_given",
                "loan_received",
                "loan_return",
                "loan_recovery",
            ],
            required: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        paymentType: {
            type: String,
            enum: ["cash", "bank transfer"],
            required: true,
        },
    },
    {
        _id: false,
    }
);




const loanAllocationSchema = new mongoose.Schema(
    {
        sourceType: {
            type: String,
            enum: ["loan", "opening_balance"],
            required: true,
        },

        sourceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        _id: false,
    }
);

//LOAN SCHEMA


const loanSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
        },

        date: {
            type: Date,
            required: true,
        },

        loanType: {
            type: String,
            enum: [
                "loan_given",
                "loan_received",
                "loan_return",
                "loan_recovery",
            ],
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        
        againstLoan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Loan",
            default: null,
        },

        
        allocations: {
            type: [loanAllocationSchema],
            default: [],
        },

        status: {
            type: String,
            enum: ["active", "paid"],
            default: "active",
        },

        paymentType: {
            type: String,
            enum: ["cash", "bank transfer"],
            required: true,
        },

        remainingBalance: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        
        transactions: {
            type: [loanTransactionSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

export const Loan = mongoose.model("Loan", loanSchema);