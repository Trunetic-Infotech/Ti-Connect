import express from "express";
import { GetGroupMessages, SendGroupMessage, UpdateGroupMessage } from "../../controller/message/groupeMessageController.js";
import { isAuthenticated } from "../../middleware/isAuthentication.js";


const router = express.Router();

router.post('/groups/send/messages', isAuthenticated, SendGroupMessage);

router.get('/get/group/messages', isAuthenticated, GetGroupMessages); 

router.patch('/groups/messages/:id', isAuthenticated, UpdateGroupMessage);




export default router;


    
