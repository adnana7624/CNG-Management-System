import mongoose from "mongoose";

const closedCylcleSchema = new mongoose.Schema({
    cycleNumber :{
        type : Number,
        required : true
    },
    statedAt : {
        type : Date,
        required : true
    },
    closedAt : {
        type : Date,
        required : true
    },
    displayMonth : {
        type : Date ,
        required : true
    },
    displayYear : {
        type : Date ,
        required : true
    },
    openingCashBalance : {
        type : Number,
        required : true
    },
    openingBankBalance : {
        type : Number,
        required : true
    },
    closingCashBalance : {
        type : Number,
        required : true
    },
    closingBankBalance : {
        type : Number,
        required : true
    },

},
{_id : false});

const workingPeriodSchema = new mongoose.Schema({
    admin : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Admin",
        required : true,
        unique : true

    },
    // keep diplay month until close buthon clecked
    displayMonth : {
        type : Date,
        required : true,
        min : 1,
        max : 12
    },
    displayYear : {
        type : Date,
        required : true
    },
    startedAt : {
        type : Date,
        required : true
    },
    cycleNumber : {
        type : Number,
        default : 1
    },
    openingCashBalance : {
        type : Number,
        default : 0
    },
    openingBankBalance : {
        type : Number,
        default : 0
    },
    lastClosedAt : {
        type : Date,
        default : null
    },
    history : {
        type : [closedCylcleSchema],
        default : []
    }
}, {timestamps : true});

export const WorkingPeriod = mongoose.model("WorkingPeriod",workingPeriodSchema);
