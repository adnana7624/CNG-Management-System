import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../models/adminModel.js";

export const adminLogin = async(req , res) =>{
    try {
        const {email , password} = req.body;
        if(!email || !password){
            return res.status(400).json({message : "email and passwrod required"})
        }

        const admin = await Admin.findOne({email})
        if(!admin){
            return res.status(401).json({message : "admin not found"})
        }

        if(admin.status === "inactive"){
            return res.status(403).json({message : "your acount is inactive"})
        }

        const comparePasswrod = await bcrypt.compare(password,admin.password)
        if(!comparePasswrod){
            return res.status(403).json({message:"password incorrect"})
        }

        const token = await jwt.sign(
            {
                id:admin._id,
                role : "admin"
            },
            process.env.JWT_SECRET,
            {
                expiresIn : "30d"
            }
        )

        return res.status(200).json({
            success : true,
            message : "admin logedIn successfully",
            token : token
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}

