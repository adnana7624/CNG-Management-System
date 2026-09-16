// // import { ExpenseCategory } from "../models/expenseCategoryModel.js";

// // // Create Expense Category
// // export const createExpenseCategory = async (req, res) => {
// //     try {
// //         const { name, description } = req.body;

// //         const expenseCategory = await ExpenseCategory.create({
// //             name,
// //             description,
// //             admin: req.user._id,
// //         });

// //         res.status(201).json({
// //             success: true,
// //             message: "Expense category created successfully",
// //             expenseCategory,
// //         });
// //     } catch (error) {
// //         res.status(500).json({
// //             success: false,
// //             message: error.message,
// //         });
// //     }
// // };

// // // Get Expense Categories
// // export const getExpenseCategories = async (req, res) => {
// //     try {
// //         const expenseCategories = await ExpenseCategory.find({
// //             admin: req.user._id,
// //         }).sort({ createdAt: -1 });

// //         res.status(200).json({
// //             success: true,
// //             count: expenseCategories.length,
// //             expenseCategories,
// //         });
// //     } catch (error) {
// //         res.status(500).json({
// //             success: false,
// //             message: error.message,
// //         });
// //     }
// // };


// import { ExpenseCategory } from "../models/expenseCategoryModel.js";

// // Create Expense Category
// export const createExpenseCategory = async (req, res) => {
//     try {
//         const { name } = req.body;

//         const expenseCategory = await ExpenseCategory.create({
//             name,
//         });

//         res.status(201).json({
//             success: true,
//             message: "Expense category created successfully",
//             expenseCategory,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// // Get All Expense Categories
// export const getExpenseCategories = async (req, res) => {
//     try {
//         const expenseCategories = await ExpenseCategory.find().sort({
//             createdAt: -1,
//         });

//         res.status(200).json({
//             success: true,
//             count: expenseCategories.length,
//             expenseCategories,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };



import { ExpenseCategory } from "../models/expenseCategoryModel.js";

// Create Expense Category
export const createExpenseCategory = async (req, res) => {
    try {
        const { name } = req.body;

        const expenseCategory = await ExpenseCategory.create({
            name,
        });

        res.status(201).json({
            success: true,
            message: "Expense category created successfully",
            expenseCategory,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get All Expense Categories
export const getExpenseCategories = async (req, res) => {
    try {
        const expenseCategories = await ExpenseCategory.find().sort({
            createdAt: -1,
        });

        res.status(200).json({
            success: true,
            count: expenseCategories.length,
            expenseCategories,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update Expense Category
export const updateExpenseCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const expenseCategory = await ExpenseCategory.findByIdAndUpdate(
            id,
            { name },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!expenseCategory) {
            return res.status(404).json({
                success: false,
                message: "Expense category not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Expense category updated successfully",
            expenseCategory,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete Expense Category
export const deleteExpenseCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const expenseCategory = await ExpenseCategory.findByIdAndDelete(id);

        if (!expenseCategory) {
            return res.status(404).json({
                success: false,
                message: "Expense category not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Expense category deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



