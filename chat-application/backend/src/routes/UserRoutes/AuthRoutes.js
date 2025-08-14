import express from "express";
import { otpSend, otpVerify, setNameController, uploadImageController } from "../../controller/AuthController.js";
import { isAuthenticated } from "../../middleware/isAuthentication.js";
import upload from './../../services/imagesUploader/uploader.js';

const router = express.Router();

router.post("/otp/send/:phone_number", otpSend);
router.post("/otp/verify/:phone_number/:otp_store", otpVerify);
router.patch("/users/setName/:id",isAuthenticated,setNameController )
router.patch("/profile/upload/:id", isAuthenticated,upload.single("profile_picture"), uploadImageController);
  

export default router;
