import express from 'express';
import { isAuthenticated } from '../../middleware/isAuthentication.js';
import { AddMembersToGroup, CreateGroup, GetGroupMembers, GetAllUserGroups, ChangeGroupName,LeaveGroups,DeleteGroup, removeMember, toggleBlockUserInGroup } from '../../controller/message/groupeMemberController.js';
import upload from '../../services/imagesUploader/uploader.js';



const router = express.Router();
router.post('/groups/create', isAuthenticated,upload.single("group_picture"), CreateGroup);
router.post('/add/members', isAuthenticated, AddMembersToGroup)
router.get('/groups/members/list/:groupId', isAuthenticated, GetGroupMembers);
router.put('/groups/name/:groupId', isAuthenticated, ChangeGroupName);
router.get('/groups/list', isAuthenticated, GetAllUserGroups);
router.delete('/groups/members/remove', isAuthenticated, removeMember);
router.delete('/delete/permanently', isAuthenticated, DeleteGroup);

router.patch("/groups/members/block", isAuthenticated, toggleBlockUserInGroup);

router.delete('/groups/leave', isAuthenticated, LeaveGroups);
export default router; 