import express from "express";
import { isAuthenticated } from "../../middleware/isAuthentication.js";
import { DeleteMessage, GetMessages, SendMessage, UpdateMessage, UploadMedia } from "../../controller/message/messageController.js";
import upload from "../../services/imagesUploader/uploader.js";



const router = express.Router();

router.post("/messages/:sender_id", isAuthenticated ,SendMessage);
router.get("/messages/:myId",isAuthenticated, GetMessages);
router.put("/messages/:id",isAuthenticated, UpdateMessage);
router.delete("/messages/:id",isAuthenticated, DeleteMessage);
router.post("/messages/upload/:sender_id",isAuthenticated,upload.single("media_url"), UploadMedia);

export default router;