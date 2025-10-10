import express from "express";
import { isAuthenticated } from "../../middleware/isAuthentication.js";
import { DeleteMessage, GetMessages, SendMessage, UpdateMessage, UploadMedia } from "../../controller/message/messageController.js";
import upload from "../../services/imagesUploader/uploader.js";



const router = express.Router();

router.post("/messages", isAuthenticated ,SendMessage);
router.get("/get/messages",isAuthenticated, GetMessages);
router.put("/messages/:id",isAuthenticated, UpdateMessage);
router.delete("/messages/:messageId",isAuthenticated, DeleteMessage);
router.post("/messages/upload",isAuthenticated, upload.array("media_url", 10), UploadMedia);

export default router;