import mongoose from "mongoose";

const captureImageSchema = new mongoose.Schema({
    imageType :{
        type : String,
        enum : ["vb1","vs1","rflow","digitalMachine","counter","microMotion"],
        required : true
    },
    imageUrl :{
        type : String,
        required : true,
        trim : true
    },
    publicId :{
        type : String,
        default : ""
    },
    captureAt : {
        type : Date,
        required : true,
        default : Date.now
    },
    
},
    {
        _id : false
    }
);



const captureSchema = new mongoose.Schema({
    admin : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Admin",
        required : true
    },
    captureType : {
        type : String,
        enum : ["meter", "nozzle"],
        required : true
    },
    nozzleNumber : {
        type : Number,
        enum : [1 , 2, 3, 4],
        default : null
    },
    status : {
        type : String,
        enum : ["in_progress","completed","expired"],
        default : "in_progress"
    },
    startedAt : {
        type : Date,
        default : null
    },
    expiresAt : {
        type : Date,
        default : null
    },
    completedAt : {
        type : Date,
        default :null
    },
    images : {
        type : [captureImageSchema],
        default : []
    }
},{timestamps : true});

export const Capture = mongoose.model("Capture",captureSchema);

