import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import {User} from "../models/userModel.js";
import connectDB from "../config/db.js";

dotenv.config();

const createSuperAdmin = async()=>{
    try {
        console.log("Connecting to MongoDB...");

        await connectDB();

        // check if superadmin already exist
        const exitingSuperAdmin = await User.findOne({role:"SuperAdmin"});
        if(exitingSuperAdmin){
            console.log("superadmin already exist")
            process.exit(0);
        }
        
        // encript password
        const hashpassword = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD,10)

        // create super admin
        const superAdmin = await User.create({
            name : process.env.SUPERADMIN_NAME,
            email : process.env.SUPERADMIN_EMAIL,
            password : hashpassword,
            role : "SuperAdmin"
        })

        console.log("super admin created succespully")
        
        process.exit(0);
    } catch (error) {
        console.error("ERROR:", error);
        process.exit(0);
    }
}

createSuperAdmin();

