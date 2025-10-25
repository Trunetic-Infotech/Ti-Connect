import express from "express";
import { GetGroupMessages, SendGroupMessage, SendGroupMessageUploadController, UpdateGroupMessage } from "../../controller/message/groupeMessageController.js";
import { isAuthenticated } from "../../middleware/isAuthentication.js";
import upload from "../../services/imagesUploader/uploader.js";


const router = express.Router();

router.post('/groups/send/messages', isAuthenticated, SendGroupMessage);

router.get('/get/group/messages', isAuthenticated, GetGroupMessages); 

router.patch('/groups/messages/:id', isAuthenticated, UpdateGroupMessage);

router.post('/groups/send/messages/upload', isAuthenticated, upload.array("media_url", 10), SendGroupMessageUploadController);


export default router;


    
