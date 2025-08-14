import express from "express";
import { otpSend, otpVerify } from "../../controller/AuthController.js";

const router = express.Router();

router.post("/otp/send/:phone_number", otpSend);
router.post("/otp/verify/:phone_number/:otp_store", otpVerify);

export default router;
