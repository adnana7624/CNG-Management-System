import { Sale } from "../models/saleModel.js";

export const createSale = async (req, res) => {
    try {
        const { date, cngVolume, amount, paymentMethod, notes } = req.body;
        if (!date || !cngVolume || !amount || !paymentMethod) {
            return res.status(400).json({ message: "all fields are required" })
        }

        const adminId = req.user.id;

        if (Number(cngVolume) <= 0) {
            return res.status(400).json({ message: "cng volume must be greater than 0" })
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "error during add sale ",
            message: error.message
        })
    }
}
