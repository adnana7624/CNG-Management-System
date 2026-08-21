import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const loginSuperAdmin = async(req , res)=>{
    try {
        const {email , password} = req.body;

        // check required fields
        if(!email || !password){
            return res.status(400).json({
                success : false,
                message : "email and password both are required"
            })
        }

        // find super admin
        const superAdmin = await User.findOne({
            email : email.toLowerCase(),
            role : "SuperAdmin"
        })
        if(!superAdmin){
            return res.status(401).json({
                success : false,
                message : "only super admin allowed"
            })
        }
        
        // compare password 
        const isPasswordCorrect = await bcrypt.compare(password,superAdmin.password)
        if(!isPasswordCorrect){
            return res.status(401).json({
                success : false,
                message : "password incorrect"
            })
        }

        // generate JWT token
        const token = await jwt.sign(
            {
            id : superAdmin._id,
            role : superAdmin.role
            },
            process.env.JWT_SECRET,
            {expiresIn : "10d"}
            )
        
        return res.status(200).json({
            success : true ,
            message : "super admin logedIn successfull",
            token : token
        })
        
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}