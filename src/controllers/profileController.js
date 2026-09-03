import { Admin } from "../models/adminModel.js";


export const getAdminProfile = async(req , res) =>{
    try {
        const adminId = req.user.id;

        const admin = await Admin.findById(adminId).select("-password");
        
        if(!admin){
            return res.status(404).json({message : "admin profile not found"})
        }

        const joiningDate = new Date(admin.createdAt).toLocaleDateString(
            "en-GB",
        {
            day : "2-digit",
            month : "long",
            year : "numeric"
        })

        return res.status(200).json({
            success : true,
            profile : {
                id : admin._id,
                fullName : admin.adminName,
                email : admin.email,
                address : admin.pumpAddress,
                role : admin.role,
                status : admin.status,
                joiningDate : joiningDate
            }
        })

    }
    catch (error){
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}
