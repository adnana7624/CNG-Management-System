
import { Capture } from "../models/captureModel.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";



export const uploadCaptureImage = async(req , res) => {
    try {
        const adminId = req.user.id;
        
        const {captureType , imageType , captureId } = req.body;

        let capture = null;

        if(!req.file){
            return res.status(400).json({message :"image is required"})
        }
        if(!imageType){
            return res.status(400).json({message : "image type is required"})
        }

        if(!captureType){
            return res.status(400).json({message : "capture type is required"})
        }

        if(!["nozzle","meter"].includes(captureType)){
            return res.status(400).json({message : "capture type must be nozzel or meter"})
        }


        // alowed image type
        const allowedType = {
            nozzle : ["digitalMachine" , "counter" , "microMotion"],
            meter : ["vb1" , "vs1" , "rflow"]
        };

        if(!allowedType[captureType].includes(imageType)){
            return res.status(400).json({
                message : `invalid inage type for ${captureType}`
            })
        }

        // set required images
        const requiredImages = captureType === "meter"?["vb1","vs1"] : ["digitalMachine","counter"];

        const isRequiredImage = requiredImages.includes(imageType);

        // let capture = null;

        if(captureId){
            capture = await Capture.findOne({
                _id : captureId,
                admin : adminId
            })
        }
        else{
            capture = await Capture.findOne({
                admin : adminId,
                captureType,
                status : "in_progress"
            }).sort({createdAt : -1})
        }
        
    
        // chechk active capture type
        if(capture){
            if(capture.captureType !== captureType){
                return res.status(400).json({message : `an active ${capture.captureType} capture already exist `})
            }
            if(!capture.expiresAt || new Date() > capture.expiresAt){
                capture.status = "expired",
                await capture.save();

                return res.status(400).json({
                    message : "2 minute capture window has expired, please start again"
                })
            }
            // already expired capture
            if(capture.status === "expired"){
                return res.status(400).json({message : "this capture has expired"})
            }
            if(capture.status === "completed" && isRequiredImage){
                return res.status(400).json({message : "required image already completed"})
            }

        };
        if(!capture){
            if(!isRequiredImage){
                return res.status(400).json({message : "the first image must required"})
            }

            const startTime = new Date();
            const expiryTime =new Date(
                startTime.getTime() + 2 *60 *1000
            );

            capture = await Capture.create({
                admin : adminId,
                captureType,
                status : "in_progress",
                startedAt : startTime,
                expiresAt : expiryTime,
                completedAt : null ,
                images : []
            })
        }

        if(!Array.isArray(capture.images)){
            capture.images = [];
        }

        // check duplicate image
        const alreadyExists = capture.images.some(
            image => image.imageType === imageType
        )

        if(alreadyExists){
            return res.status(400).json({
                message : `${imageType} image has been alreadt uploaded`
            })
        }

        // check required image order
        if(isRequiredImage){
            const uploadRequiredImages = capture.images.filter(
                image => requiredImages.includes(image.imageType)
            ).map(image => image.imageType)
            const nextRequiredImage = requiredImages.find(
                type => !uploadRequiredImages.includes(type));

                if(imageType !== nextRequiredImage){
            return res.status(400).json({message : `please upload ${nextRequiredImage} first`})
            }
        }

        // optional image check
        if(!isRequiredImage){
            const uploadRequiredImages = capture.images.filter(
                image => requiredImages.includes(image.imageType)
            )

            const allRequiredUploaded = requiredImages.every(
                type => uploadRequiredImages.includes(type)
            )

            if(!allRequiredUploaded){
                return res.status(400).json({message : "upload all required image first"})
            }

        }

        // upload image on cloudinary
        const cloudinaryResult = await uploadOnCloudinary(req.file.path);

        if(!cloudinaryResult){
            return res.status(500).json({message : "Image UPload Failed"})
        }

        // add image to 
        const captureAt = new Date();

        capture.images.push({
            imageType ,
            imageUrl : cloudinaryResult.secure_url,
            publicId : cloudinaryResult.public_id,
            captureAt : new Date()
        })

        // check required image
        const uploadRequiredTypes = capture.images.filter(
            image => requiredImages.includes(image.imageType)
        ).map(image => image.imageType);

        const allRequiredUploaded = requiredImages.every(
            type => uploadRequiredTypes.includes(type)
        )

        // next image
        const nextRequiredImage = requiredImages.find(type => !uploadRequiredTypes.includes(type)) || null;

        // complete when required image complete
        // if(allRequiredUploaded && capture.status === "in_progress"){
        //     capture.status = "completed";
        //     capture.completedAt = new Date();
            
        // }

        await capture.save();

        
        return res.status(200).json({
            success : true,
            message : `${imageType} image uploaded successfully`,
            images : {
                imageType,
                imageUrl : cloudinaryResult.secure_url,
                captureAt:capture.images[capture.images.length-1 ].captureAt
            },
            capture : {
                id : capture._id,
                captureType : capture.captureType,
                status : capture.status,
                startedAt : capture.startedAt,
                expiresAt  : capture.expiresAt,
                completedAt : capture.completedAt,
                requiredImages : requiredImages,
                uploadedImage : capture.images.map(image => ({

                    imageType : image.imageType,
                    imageUrl : image.imageUrl,
                    capturedAt : image.captureAt
                })),
                requiredImagesCompleted : allRequiredUploaded,
                nextRequiredImage
            }
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}


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
        const requiredTypes = {
            nozzle : ["digitalMachine","counter"],
            meter : ["vb1","vs1"]
        }

        const requiredImages = requiredTypes[capture.captureType];
        const uploadedImage = capture.images.map(image => image.imageType);

        // check all required images
        const missingImages = requiredImages.filter(type => !uploadedImage.includes(type));

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
                captureType : capture.captureType,
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
        const captures = await Capture.find({admin : adminId}).sort({createdAt : -1});

        return res.status(200).json({
            success : true,
            count : captures.length,
            captures
        })

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}