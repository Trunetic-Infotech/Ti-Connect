import express from "express";
import { isAuthenticated } from "../../middleware/isAuthentication.js";
import { DeleteMessage, GetMessages, GetOlderMessages, MarkMessageDelivered, MarkMessageRead, SendMessage, UpdateMessage, UploadMedia } from "../../controller/message/messageController.js";
import upload from "../../services/imagesUploader/uploader.js";



const router = express.Router();

router.post("/messages", isAuthenticated, SendMessage);
router.post("/messages/:messageId/delivered", MarkMessageDelivered);
router.post("/messages/:messageId/read", MarkMessageRead);
router.get("/get/messages", isAuthenticated, GetMessages);
router.put("/messages/:messageId", isAuthenticated, UpdateMessage);
router.delete("/messages/:messageId", isAuthenticated, DeleteMessage);
router.post("/messages/upload", isAuthenticated, upload.array("media_url", 10), UploadMedia);
router.get("/get/messages/older", isAuthenticated, GetOlderMessages);

export default router;