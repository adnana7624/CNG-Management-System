import bcrypt from "bcryptjs";
import { Admin } from "../models/adminModel.js";


export const createAdmin = async(req , res)=>{
    try {
        const {pumpName , adminName, email , password ,pumpAddress } = req.body;

        // check required field
        if(!pumpName ||!adminName || !email || !password ){
            return res.status(400).json({message : "all field are required"})
        }
        // check if user already exist
        const existingUser = await Admin.findOne({email})
        if(existingUser){
            return res.status(409).json({message : "admin with this email already exist"})
        }
        // encrypt password
        const hashedPassword = await bcrypt.hash(password,10)

        
        // create admin
        const admin = await Admin.create({
            pumpName,
            adminName,
            email,
            pumpAddress,
            password : hashedPassword,
            role : "admin"
        })

        return res.status(201).json({
            success : true,
            message : "admin created successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}

export const getAllAdmins = async (req , res)=>{
    try {
        const admins = await Admin.find()

        return res.status(200).json({
            success : true,
            count : admins.length,
            admins
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}

export const getSingleAdmin = async(req , res) => {
    try {
        const {id} = req.params;

        const admin = await Admin.findById(id)
        if(!admin){
            return res.status(400).json({
                success : false,
                message : "admin not found"
            })
        }

        return res.status(200).json({
            success : true,
            admin
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}

export const updateAdmin = async(req , res) => {
    try {
        const {id} = req.params;

        const {pumpName , adminName , pumpAddress , email , password ,status} = req.body;

        const admin = await Admin.findById(id)
        if(!admin){
            return res.status(400).json({message : "admin not found to update it"})
        }

        if(pumpName != undefined){
            admin.pumpName = pumpName
        }
        if(adminName != undefined){
            admin.adminName = adminName
        }
        if(email != undefined){
            admin.email = email
        }
        if(pumpAddress != undefined){
            admin.pumpAddress = pumpAddress
        }
        if(status != undefined){
            admin.status = status
        }
        if(password != undefined){
            admin.password = await bcrypt.hash(password,10)
        }
        await admin.save();

        return res.status(200).json({
            success: true,
            message: "Admin updated successfully",
            admin
        });

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}

export const deleteAdmin = async (req, res) =>{
    try {
        const {id} = req.params;
        
        const admin = await Admin.findById(id);
        if(!admin){
            return res.status(404).json({message : "admin not found to delete it"})
        }

        await Admin.findByIdAndDelete(id);

        return res.status(200).json({
            success : true ,
            message : "admin deleted succfully"
        })
        
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}