import { Capture } from "../models/captureModel.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {Admin} from "../models/adminModel.js";


export const uploadCaptureImage = async (req, res) => {
    try {
        const adminId = req.user.id;

        const {
            captureType,
            imageType,
            captureId,
            nozzleNumber
        } = req.body;

        let capture = null;

        // BASIC VALIDATION

        if (!req.file) {
            return res.status(400).json({
                message: "image is required"
            });
        }

        if (!imageType) {
            return res.status(400).json({
                message: "image type is required"
            });
        }

        if (!captureType) {
            return res.status(400).json({
                message: "capture type is required"
            });
        }

        if (!["nozzle", "meter"].includes(captureType)) {
            return res.status(400).json({
                message: "capture type must be nozzle or meter"
            });
        }

        // NOZZLE NUMBER VALIDATION

        if (captureType === "nozzle") {
            if (!nozzleNumber) {
                return res.status(400).json({
                    message: "nozzle number is required"
                });
            }

            const numericNozzleNumber = Number(nozzleNumber);

            if (![1, 2, 3, 4].includes(numericNozzleNumber)) {
                return res.status(400).json({
                    message: "nozzle number must be 1, 2, 3 or 4"
                });
            }
        }

        // ALLOWED IMAGE TYPES
        
        const allowedType = {
            nozzle: [
                "digitalMachine",
                "counter",
                "microMotion"
            ],
            meter: [
                "vb1",
                "vs1",
                "rflow"
            ]
        };

        if (!allowedType[captureType].includes(imageType)) {
            return res.status(400).json({
                message: `invalid image type for ${captureType}`
            });
        }

        const admin = await Admin.findById(adminId).select("adminName pumpName")
        if(!admin){
            return res.status(404).json({message : "admin not found"})
        }
        const adminName = admin.adminName;
        const pumpName = admin.pumpName;
        // REQUIRED IMAGES

        const requiredImages =
            captureType === "meter"
                ? ["vb1", "vs1"]
                : ["digitalMachine", "counter"];

        const isRequiredImage = requiredImages.includes(imageType);


        // FIND CAPTURE
        if (captureId) {

            capture = await Capture.findOne({
                _id: captureId,
                admin: adminId
            });

        } else {

            const captureQuery = {
                admin: adminId,
                captureType,
                status: "in_progress"
            };

            if (captureType === "nozzle") {
                captureQuery.nozzleNumber = Number(nozzleNumber);
            }

            capture = await Capture.findOne(captureQuery)
                .sort({ createdAt: -1 });
        }

        // CHECK EXISTING CAPTURE


        if (capture) {

            // Check capture type
            if (capture.captureType !== captureType) {
                return res.status(400).json({
                    success: false,
                    message: "capture type does not match"
                });
            }

            // Check nozzle number
            if (
                captureType === "nozzle" &&
                capture.nozzleNumber !== Number(nozzleNumber)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "nozzle number does not match this capture"
                });
            }

            // =========================
            // CHECK COMPLETED CAPTURE
            // =========================

            if (capture.status === "completed") {
                return res.status(400).json({
                    success: false,
                    message: "capture already completed"
                });
            }

            // =========================
            // CHECK EXPIRED CAPTURE
            // =========================

            if (
                capture.status === "expired" ||
                !capture.expiresAt ||
                new Date() > new Date(capture.expiresAt)
            ) {

                capture.status = "expired";

                await capture.save();

                // IMPORTANT:
                // If this request is trying to start a NEW capture,
                // allow creation below.
                capture = null;
            }
        }

        // CREATE NEW CAPTURE
        if (!capture) {

            // Optional image cannot start a capture
            if (!isRequiredImage) {
                return res.status(400).json({
                    message: "the first image must be a required image"
                });
            }

            const startedAt = new Date();

            const expiresAt = new Date(
                startedAt.getTime() + 2 * 60 * 1000
            );

            capture = await Capture.create({
                admin: adminId,
                adminName,
                pumpName,
                captureType,
                nozzleNumber:
                    captureType === "nozzle"
                        ? Number(nozzleNumber)
                        : null,
                status: "in_progress",
                startedAt,
                expiresAt,
                completedAt: null,
                images: []
            });
        }

        // =========================
        // MAKE SURE IMAGES IS ARRAY
        // =========================

        if (!Array.isArray(capture.images)) {
            capture.images = [];
        }

        // =========================
        // CHECK DUPLICATE IMAGE
        // =========================

        const alreadyExists = capture.images.some(
            image => image.imageType === imageType
        );

        if (alreadyExists) {
            return res.status(400).json({
                message: `${imageType} image has already been uploaded`
            });
        }

        // =========================
        // REQUIRED IMAGE ORDER
        // =========================

        if (isRequiredImage) {

            const uploadedRequiredTypes = capture.images
                .filter(image =>
                    requiredImages.includes(image.imageType)
                )
                .map(image => image.imageType);

            const nextRequiredImage = requiredImages.find(
                type => !uploadedRequiredTypes.includes(type)
            );

            if (imageType !== nextRequiredImage) {
                return res.status(400).json({
                    message: `please upload ${nextRequiredImage} first`
                });
            }
        }

        // =========================
        // OPTIONAL IMAGE CHECK
        // =========================

        if (!isRequiredImage) {

            // Get only required image types
            const uploadedRequiredTypes = capture.images
                .filter(image =>
                    requiredImages.includes(image.imageType)
                )
                .map(image => image.imageType);

            // Check whether ALL required images exist
            const allRequiredUploaded = requiredImages.every(
                type => uploadedRequiredTypes.includes(type)
            );

            if (!allRequiredUploaded) {
                return res.status(400).json({
                    message: "upload all required image first"
                });
            }
        }

        // =========================
        // UPLOAD TO CLOUDINARY
        // =========================

        const cloudinaryResult = await uploadOnCloudinary(
            req.file.path
        );

        if (!cloudinaryResult) {
            return res.status(500).json({
                message: "image upload failed"
            });
        }

        // =========================
        // ADD IMAGE TO CAPTURE
        // =========================

        const captureAt = new Date();

        capture.images.push({
            imageType,
            imageUrl: cloudinaryResult.secure_url,
            publicId: cloudinaryResult.public_id,
            captureAt
        });

        // =========================
        // CHECK REQUIRED IMAGES
        // =========================

        const uploadedTypes = capture.images.map(
            image => image.imageType
        );

        const allRequiredUploaded = requiredImages.every(
            type => uploadedTypes.includes(type)
        );

        // Save capture
        await capture.save();

        // =========================
        // NEXT REQUIRED IMAGE
        // =========================

        const nextRequiredImage =
            requiredImages.find(
                type => !uploadedTypes.includes(type)
            ) || null;

        // =========================
        // RESPONSE
        // =========================

        return res.status(200).json({
            success: true,

            message: `${imageType} image uploaded successfully`,

            images: {
                imageType,
                imageUrl: cloudinaryResult.secure_url,
                captureAt
            },

            capture: {
                id: capture._id,
                adminName,
                pumpName,
                captureType: capture.captureType,
                nozzleNumber: capture.nozzleNumber,
                status: capture.status,
                startedAt: capture.startedAt,
                expiresAt: capture.expiresAt,
                completedAt: capture.completedAt,

                requiredImages,

                uploadedImage: capture.images.map(
                    image => ({
                        imageType: image.imageType,
                        imageUrl: image.imageUrl,
                        capturedAt: image.captureAt
                    })
                ),

                requiredImagesCompleted: allRequiredUploaded,

                nextRequiredImage
            }
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const completeCapture = async(req,res) =>{
    try {
        const adminId = req.user.id;
        const {captureId} = req.params;

        // find capture
        const capture = await Capture.findOne({
            _id : captureId,
            admin : adminId
        })
        if(!capture){
            return res.status(404).json({message : "capture not found"})
        };

        // check status 
        if(capture.status === "completed"){
            return res.status(400).json({message : "capture already completed"})
        }

        if(capture.status === "expired"){
            return res.status(400).json({message : "this captured has expired please start new one"})
        }


        // check 2 minute window
        if(capture.expiresAt && new Date() > new Date(capture.expiresAt)){
            capture.status = "expired",
            await capture.save();
            return res.status(400).json({message : "2 minute window expired please start new one"})
        }

        // required image
        // const requiredTypes = {
        //     nozzle : ["digitalMachine","counter"],
        //     meter : ["vb1","vs1"]
        // }

        const requiredTypes = capture.captureType === "meter"?["vb1","vs1"] : ["digitalMachine","counter"]
        const uploadedImages = capture.images.map(image => image.imageType);

        // check all required images
        const missingImages = requiredTypes.filter(type => !uploadedImages.includes(type));

        if(missingImages.length > 0){
            return res.status(400).json({
                message : "required images are missing",
                missingImages
            })
        }


        // complete capture
        capture.status = "completed",
        capture.completedAt = new Date();
        await capture.save();

        return res.status(200).json({
            success : true,
            message : "capture completed succesfully",
            capture : {
                id : capture._id,
                adminName : capture.adminName,
                pumpName : capture.pumpName,
                captureType : capture.captureType,
                nozzleNumber : capture.nozzleNumber,
                status : capture.status,
                startedAt : capture.startedAt,
                expiresAt : capture.expiresAt,
                completedAt : capture.completedAt,
                images : capture.images
            }
        })

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}

export const getCaptureHistory = async(req , res) => {
    try {
        const adminId = req.user.id;
        const captures = await Capture.find({admin : adminId}).sort({createdAt : -1}).lean();

        return res.status(200).json({
            success : true,
            count : captures.length,
            captures : captures.map(capture => ({
                id : capture._id,
                adminName : capture.adminName,
                pumpName : capture.pumpName,
                captureType : capture.captureType,
                nozzleNumber : capture.nozzleNumber,
                status : capture.status,
                startedAt : capture.startedAt,
                expiresAt : capture.expiresAt,
                completedAt : capture.completedAt,
                images : capture.images.map(
                    image =>({
                        imageType : image.imageType,
                        imageUrl : image.imageUrl,
                        captureAt : image.captureAt
                    })
                )
            }))
        })

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}

export const getAllCaptureHistory = async(req , res) => {
    try {
        // const adminId = req.user.id;
        const captures = await Capture.find({status : "completed"})

        return res.status(200).json({
            success : true,
            count : captures.length,
            captures : captures.map(capture => ({
                id : capture._id,
                adminName : capture.adminName,
                pumpName : capture.pumpName,
                captureType : capture.captureType,
                nozzleNumber : capture.nozzleNumber,
                status : capture.status,
                startedAt : capture.startedAt,
                expiresAt : capture.expiresAt,
                completedAt : capture.completedAt,
                images : capture.images.map(
                    image =>({
                        imageType : image.imageType,
                        imageUrl : image.imageUrl,
                        captureAt : image.captureAt
                    })
                )
            }))
        })

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}