import group_messages from "../../config/Database.js";
import group_members from "../../config/Database.js";
import create_groups from "../../config/Database.js";
import cloudinary from "../../utils/images/Cloudinary.js";
import { io } from "../../utils/socket/socket.js";
import CryptoJS from "crypto-js";

// Send a message to a group
// export const SendGroupMessage = async (req, res) => {
// };

export const SendGroupMessage = async (req, res) => {
  try {
    const sender_id = req.user.id;
    const {
      groupId,
      message = null,
      message_type = "text",
      contact_details = null,
      media_url = null,
    } = req.body;

    if (!groupId) {
      return res
        .status(400)
        .json({ success: false, error: "Group ID is required" });
    }

    const [groupInfo] = await create_groups.execute(
      "SELECT admin_id FROM create_groups WHERE id = ?",
      [groupId]
    );
    if (!groupInfo.length)
      return res.status(404).json({ success: false, error: "Group not found" });

    const isAdmin = groupInfo[0].admin_id === sender_id;
    let isMember = false;

    if (!isAdmin) {
      const [membership] = await group_members.execute(
        "SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND Block_Group != 'block' AND Leave_Group != 1",
        [groupId, sender_id]
      );
      isMember = membership.length > 0;
    }

    if (!isAdmin && !isMember) {
      return res
        .status(403)
        .json({ success: false, error: "You are not a member of this group" });
    }

    // ✅ Encrypt message
    const encryptionKey =
      process.env.MESSAGE_ENCRYPTION_KEY || "default_encryption_key";
    let msgText = message;
    let contactData =
      contact_details && typeof contact_details === "object"
        ? JSON.stringify(contact_details)
        : contact_details;

    if (message_type === "text" && msgText) {
      msgText = CryptoJS.AES.encrypt(msgText, encryptionKey).toString();
    }

    if (message_type === "contact" && contactData) {
      contactData = CryptoJS.AES.encrypt(contactData, encryptionKey).toString();
    }

    // ✅ Save encrypted
    // const [result] = await group_messages.execute(
    //   "INSERT INTO group_messages (group_id, sender_id, message, message_type, contact_details, media_url) VALUES (?, ?, ?, ?, ?, ?)",
    //   [groupId, sender_id, msgText, message_type, contactData, media_url]
    // );

    const contactDetailsJSON =
      contact_details && typeof contact_details === "object"
        ? JSON.stringify(contact_details)
        : contact_details || null;

    const [result] = await group_messages.execute(
      "INSERT INTO group_messages (group_id, sender_id, message, message_type, contact_details, media_url) VALUES (?, ?, ?, ?, ?, ?)",
      [groupId, sender_id, msgText, message_type, contactDetailsJSON, media_url]
    );

    // ✅ Decrypt for sender’s UI
    const decrypt = (cipher) => {
      try {
        const bytes = CryptoJS.AES.decrypt(cipher, encryptionKey);
        return bytes.toString(CryptoJS.enc.Utf8);
      } catch {
        return cipher;
      }
    };

    const decryptedMessage =
      message_type === "text" && msgText ? decrypt(msgText) : message;
    const decryptedContact =
      message_type === "contact" && contactData
        ? decrypt(contactData)
        : contact_details;

    // ✅ New message object
    const newGroupMessage = {
      id: result.insertId,
      sender_id,
      group_id: groupId,
      message: decryptedMessage,
      message_type,
      contact_details: decryptedContact || null,
      media_url: media_url || null,
      created_at: new Date(),
      isSender: true,
    };

    io.to(`group_${groupId}`).emit("groupNewMessage", newGroupMessage);

    return res.json({ success: true, newGroupMessage });
  } catch (error) {
    console.error("❌ Error sending group message:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to send group message" });
  }
};

export const SendGroupMessageUploadController = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const groupId = req.body.groupId || null;
    const senderId = req.user?.id || null;

    if (!groupId || !senderId) {
      return res.status(400).json({
        success: false,
        message: "Missing groupId or senderId",
      });
    }

    const getType = (file) => {
      if (file.mimetype.startsWith("image/")) return "image";
      if (file.mimetype.startsWith("video/")) return "video";
      if (file.mimetype.startsWith("audio/")) return "audio";
      if (file.mimetype === "application/pdf" || file.mimetype === "image/pdf")
        return "document";
      if (file.mimetype === "text/contact") return "text";
      return "file";
    };
    console.log(getType);

    const fileTypes = req.files.map(getType);
    const hasVideo = fileTypes.includes("video");
    const hasAudio = fileTypes.includes("audio");

    if ((hasVideo || hasAudio) && req.files.length > 1) {
      return res.status(400).json({
        success: false,
        message: "You can upload only one video or one audio file at a time.",
      });
    }

    // Extract media info safely
    const mediaType = fileTypes[0] || "file";
    const mediaPath = req.files[0]?.path || null;

    if (!mediaPath) {
      return res.status(400).json({
        success: false,
        message: "Invalid file path or missing file",
      });
    }

    // ✅ Insert into DB
    const [newGroupMessage] = await group_messages.execute(
      `INSERT INTO group_messages (group_id, sender_id, message, message_type, media_url) VALUES (?, ?, ?, ?, ?)`,
      [groupId, senderId, null, mediaType, mediaPath]
    );
    console.log(newGroupMessage);

    const uploadedFiles = req.files.map((file) => ({
      url: file.path,
      type: file.mimetype,
      filename: file.filename,
    }));

    // ✅ Emit to socket
    io.to(`group_${groupId}`).emit("groupNewMessage", newGroupMessage);
    console.log(`📡 Emitted message to group_${groupId}`, newGroupMessage);

    return res.status(200).json({
      success: true,
      message: "File(s) uploaded successfully",
      fileUrl: uploadedFiles[0].url,
      files: uploadedFiles,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get messages for a specific group
export const GetGroupMessages = async (req, res) => {
  try {
    const sender_id = req.user.id; // Current logged-in user
    const { groupId } = req.query;

    // console.log(`Fetching messages for group ID: ${groupId} by user ID: ${sender_id}`);

    // ✅ Validate input
    if (!groupId) {
      return res.status(400).json({ error: "Group ID is required" });
    }

    // ------------------------------
    // ✅ Check if the user is blocked in the group
    // ------------------------------
    const [blockedRows] = await group_members.execute(
      `SELECT * 
       FROM group_members 
       WHERE group_id = ? AND user_id = ? AND Block_Group = ?`,
      [groupId, sender_id, "block"]
    );
    if (blockedRows.length > 0) {
      return res.status(403).json({ error: "You are blocked in this group" });
    }

    // ------------------------------
    // ✅ Check if the user has left the group
    // ------------------------------
    const [leftRows] = await group_members.execute(
      `SELECT * 
       FROM group_members 
       WHERE group_id = ? AND user_id = ? AND Leave_Group = ?`,
      [groupId, sender_id, 1]
    );
    if (leftRows.length > 0) {
      return res.status(403).json({ error: "You have left this group" });
    }

    // ------------------------------
    // ✅ Check if the user is a member or the admin
    // ------------------------------
    const [groupRows] = await group_members.execute(
      `SELECT gm.*, cg.admin_id
       FROM create_groups cg
       LEFT JOIN group_members gm 
         ON gm.group_id = cg.id AND gm.user_id = ?
       WHERE cg.id = ?`,
      [sender_id, groupId]
    );

    if (groupRows.length === 0) {
      return res
        .status(403)
        .json({ error: "You are not a member of this group" });
    }

    // User is considered admin if they are the admin_id
    const isAdmin = groupRows[0].admin_id === sender_id;
    console.log("Group membership verified. Is Admin:", isAdmin);

    // ------------------------------
    // ✅ Fetch messages with sender details
    // ------------------------------
    const [messages] = await group_messages.execute(
      `SELECT gm.*, u.username, u.profile_picture, u.status AS user_status
       FROM group_messages gm
       JOIN users u 
         ON gm.sender_id = u.id
       WHERE gm.group_id = ?
       ORDER BY gm.created_at ASC`,
      [groupId]
    );

    // // Decrypt messages before sending
    const encryptionKey =
      process.env.MESSAGE_ENCRYPTION_KEY || "default_encryption_key";
    const decrypt = (cipher) => {
      try {
        const bytes = CryptoJS.AES.decrypt(cipher, encryptionKey);
        const originalMessage = bytes.toString(CryptoJS.enc.Utf8);
        return originalMessage;
      } catch (error) {
        console.error("Decryption error:", error);
        return null; // or handle the error as per your requirements
      }
    };

    messages.forEach((message) => {
      message.message = decrypt(message.message);
    });

    // ------------------------------
    io.to(`group_${groupId}`).emit("groupNewMessage", messages);
    console.log(`Emitted message to room group ${groupId}`);
    console.log(messages);

    // ------------------------------
    // ✅ Respond with messages
    // ------------------------------
    return res.json({
      success: true,
      isAdmin,
      messages: messages || [],
    });
  } catch (error) {
    console.error("❌ Error fetching group messages:", error);
    res.status(500).json({ error: "Failed to fetch group messages" });
  }
};

// Get paginated messages for a specific group
// export const GetGroupMessages = async (req, res) => {
//   try {
//     const sender_id = req.user.id; // Current logged-in user
//     const { groupId } = req.query;

//     let { page = 1, limit = 35 } = req.query; // ✅ Default limit = 15
//     page = parseInt(page);
//     limit = parseInt(limit);
//     const offset = (page - 1) * limit;

//     // ✅ Validate input
//     if (!groupId) {
//       return res.status(400).json({ error: "Group ID is required" });
//     }

//     // ✅ Check if the user is blocked in the group
//     const [blockedRows] = await group_members.execute(
//       `SELECT *
//        FROM group_members
//        WHERE group_id = ? AND user_id = ? AND Block_Group = ?`,
//       [groupId, sender_id, "block"]
//     );
//     if (blockedRows.length > 0) {
//       return res.status(403).json({ error: "You are blocked in this group" });
//     }

//     // ✅ Check if the user has left the group
//     const [leftRows] = await group_members.execute(
//       `SELECT *
//        FROM group_members
//        WHERE group_id = ? AND user_id = ? AND Leave_Group = ?`,
//       [groupId, sender_id, 1]
//     );
//     if (leftRows.length > 0) {
//       return res.status(403).json({ error: "You have left this group" });
//     }

//     // ✅ Check if the user is a member or the admin
//     const [groupRows] = await group_members.execute(
//       `SELECT gm.*, cg.admin_id
//        FROM create_groups cg
//        LEFT JOIN group_members gm
//          ON gm.group_id = cg.id AND gm.user_id = ?
//        WHERE cg.id = ?`,
//       [sender_id, groupId]
//     );

//     if (groupRows.length === 0) {
//       return res
//         .status(403)
//         .json({ error: "You are not a member of this group" });
//     }

//     const isAdmin = groupRows[0].admin_id === sender_id;

//     // ✅ Fetch total count for pagination
//     const [countResult] = await group_messages.execute(
//       `SELECT COUNT(*) AS total FROM group_messages WHERE group_id = ?`,
//       [groupId]
//     );
//     const totalMessages = countResult[0].total;
//     const totalPages = Math.ceil(totalMessages / limit);

//     // ✅ Fetch messages with LIMIT + OFFSET
//     const [messages] = await group_messages.execute(
//       `SELECT gm.*, u.username, u.profile_picture, u.status AS user_status
//        FROM group_messages gm
//        JOIN users u ON gm.sender_id = u.id
//        WHERE gm.group_id = ?
//        ORDER BY gm.created_at DESC
//        LIMIT ${limit} OFFSET ${offset}`,
//       [groupId]
//     );

//     // ✅ Emit live updates only for new messages (not for fetching old)
//     if (page === 1) {
//       io.to(`group_${groupId}`).emit("groupNewMessage", messages);
//       console.log(`Emitted messages to room group_${groupId}`);
//     }

//     // ✅ Return paginated response
//     return res.json({
//       success: true,
//       isAdmin,
//       page,
//       limit,
//       totalMessages,
//       totalPages,
//       messages: messages.reverse(), // Reverse so oldest appears first in UI
//     });
//   } catch (error) {
//     console.error("❌ Error fetching group messages:", error);
//     res.status(500).json({ error: "Failed to fetch group messages" });
//   }
// };

// Update a group message

export const UpdateGroupMessage = async (req, res) => {
  try {
    const userId = req.user.id; // current logged-in user
    const { id } = req.params;
    const { message, message_type = "text" } = req.body;

    if (!id || !message) {
      return res.status(400).json({
        success: false,
        message: "Message ID and message content are required",
      });
    }

    // 🔹 Get the message and sender info
    const [existingMessageRows] = await group_messages.execute(
      "SELECT sender_id, created_at FROM group_messages WHERE id = ?",
      [id]
    );

    if (existingMessageRows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    const { sender_id, created_at } = existingMessageRows[0];

    // 🔹 Only sender can update
    if (sender_id !== userId) {
      return res
        .status(403)
        .json({ error: "You can only update your own messages" });
    }

    // 🔹 Check if the message is within 15 minutes
    const now = new Date();
    const messageTime = new Date(created_at);
    const diffMinutes = (now - messageTime) / 1000 / 60; // difference in minutes

    if (diffMinutes > 15) {
      return res.status(403).json({
        success: false,
        message: "You can only update messages within 15 minutes of sending",
      });
    }

    // 🔹 Update the message
    const [GroupMessageUpdated] = await group_messages.execute(
      "UPDATE group_messages SET message = ?, message_type = ? WHERE id = ?",
      [message, message_type, id]
    );

    io.to(`group_${groupId}`).emit("message_updated", GroupMessageUpdated);
    console.log(`📡 Emitted message to group_${groupId}`, GroupMessageUpdated);

    res.json({ success: true, message: "Group message updated successfully" });
  } catch (error) {
    console.log("❌ Error updating group message:", error);
    res.status(500).json({ error: "Failed to update group message" });
  }
};

// Delete a group message
export const DeleteGroupMessage = async (req, res) => {
  try {
    const userId = req.user.id; // current logged-in user
    const { id, groupId } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Message ID is required" });
    }

    // 🔹 Check if the user is the sender of the message
    const [existingMessageRows] = await group_messages.execute(
      "SELECT sender_id, message_type, media_url FROM group_messages WHERE id = ?",
      [id]
    );
    if (existingMessageRows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    const { sender_id, message_type, media_url } = existingMessageRows[0];

    if (sender_id !== userId) {
      return res
        .status(403)
        .json({ error: "You can only delete your own messages" });
    }

    // 🔹 Delete media from Cloudinary if exists
    if (media_url && ["image", "video", "voice"].includes(message_type)) {
      try {
        // Extract public_id from media_url
        const parts = media_url.split("/");
        const fileName = parts[parts.length - 1].split(".")[0]; // file name without extension
        const folder = parts[parts.length - 2]; // optional folder if you organized uploads
        const publicId = folder ? `${folder}/${fileName}` : fileName;

        if (message_type === "image" || message_type === "voice") {
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
          });
        } else if (message_type === "video") {
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "video",
          });
        }
      } catch (cloudErr) {
        console.log("❌ Error deleting media from Cloudinary:", cloudErr);
        // Continue deleting message even if Cloudinary fails
      }
    }

    // 🔹 Delete the message from the database
    const [DeleteGroupMessage] = await group_messages.execute(
      "DELETE FROM group_messages WHERE id = ?",
      [id]
    );

    io.to(`group_${groupId}`).emit("groupMessageDeleted", DeleteGroupMessage);
    console.log(`📡 Emitted message to group_${groupId}`, DeleteGroupMessage);

    res.json({ success: true, message: "Group message deleted successfully" });
  } catch (error) {
    console.log("❌ Error deleting group message:", error);
    res.status(500).json({ error: "Failed to delete group message" });
  }
};

// // bloack user in group
// export const BlockUserInGroup = async (req, res) => {
//   try {
//     const userId = req.user.id; // logged-in user
//     const { groupId, userToBlockId } = req.body;

//     if (!groupId) {
//       return res.status(400).json({ error: "Group ID is required" });
//     }
//     if (!userToBlockId) {
//       return res.status(400).json({ error: "User ID to block is required" });
//     }

//     // 🔹 Check if already blocked
//     const [alreadyBlockedRows] = await group_members.execute(
//       `SELECT * FROM group_members 
//        WHERE group_id = ? 
//        AND user_id = ? 
//        AND Block_Group = ?`,
//       [groupId, userToBlockId, "block"] // only 3 params
//     );

//     if (alreadyBlockedRows.length > 0) {
//       return res
//         .status(400)
//         .json({ error: "User is already blocked in this group" });
//     }

//     // 🔹 Block the user
//     const [blockUser] = await group_members.execute(
//       `UPDATE group_members 
//        SET Block_Group = ? 
//        WHERE group_id = ? 
//        AND user_id = ?`,
//       ["block", groupId, userToBlockId] // only 3 params
//     );

//     if (blockUser.affectedRows === 0) {
//       return res.status(404).json({ error: "User not found in the group" });
//     }

//     return res.json({
//       success: true,
//       message: "User blocked in group successfully",
//       blockUser,
//     });
//   } catch (error) {
//     console.log("Internal Server Error:", error);
//     return res.status(500).json({ error: "Server error", details: error });
//   }
// };

// // unblock user in group
// export const unBloackGroupUser = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { groupId, userToUnblockId } = req.body;

//     if (!groupId) {
//       return res.status(400).json({ error: "Group ID is required" });
//     }
//     if (!userToUnblockId) {
//       return res.status(400).json({ error: "User ID to unblock is required" });
//     }

//     // 🔹 Check if user is blocked in the group
//     const [isBlockedRows] = await group_members.execute(
//       `SELECT * FROM group_members 
//        WHERE group_id = ? 
//        AND user_id = ? 
//        AND Block_Group = ?`,
//       [groupId, userToUnblockId, "block"]
//     );

//     if (isBlockedRows.length === 0) {
//       return res
//         .status(400)
//         .json({ error: "User is not blocked in this group" });
//     }

//     // 🔹 Unblock the user
//     const [unblockResult] = await group_members.execute(
//       `UPDATE group_members 
//        SET Block_Group = ? 
//        WHERE group_id = ? 
//        AND user_id = ?`,
//       ["unblock", groupId, userToUnblockId]
//     );

//     // Check if row updated
//     if (unblockResult.affectedRows === 0) {
//       return res.status(404).json({ error: "User not found in the group" });
//     }

//     return res.json({
//       success: true,
//       message: "User unblocked in group successfully",
//       result: unblockResult,
//     });

//   } catch (error) {
//     console.log("Internal Error in unblock user:", error);
//     return res.status(500).json({
//       error: "Server error",
//       message: error.message,
//     });
//   }
// };

// // leave group
// export const leaveGroup = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { groupId } = req.body;

//     if (!groupId) {
//       return res.status(400).json({ error: "Group ID is required" });
//     }

//     //check if user is already left the group
//     const [alreadyLeftRows] = await group_members.execute(
//       `SELECT * FROM group_members 
//        WHERE group_id = ? 
//        AND user_id = ? 
//        AND Leave_Group = ?`,
//       [groupId, userId, 1]
//     );
//     if (alreadyLeftRows.length > 0) {
//       return res
//         .status(400)
//         .json({ error: "You have already left this group" });
//     }

//     // check its user or admin leaving the group
//     const  [groupInfoRows] = await create_groups.execute(
//       `SELECT admin_id FROM create_groups WHERE id = ?`,
//       [groupId, userId]
//     );
    
//     const [groupeMemberRows] = await group_members.execute(
//       `SELECT * FROM group_members WHERE group_id = ? AND user_id = ?`,
//       [groupId, userId]
//     );
//     if(groupeMemberRows.length === 0 || groupeMemberRows[0].Leave_Group === 1){
//       return res
//       .status(400)
//       .json({ error: "You are not a member of this group"});
//     }

//     const adminId = groupInfoRows[0].admin_id;
//     if (adminId === groupeMemberRows[0].user_id) {
//       return res
//         .status(403)
//         .json({ error: "Admin cannot leave the group. Please delete the group instead." });
//     }

//     // leave the group
//     const [leaveGroupResult] = await group_members.execute(
//       `UPDATE group_members 
//        SET Leave_Group = ? 
//        WHERE group_id = ? 
//        AND user_id = ?`,
//       [1, groupId, userId]
//     );

//     if (leaveGroupResult.affectedRows === 0) {
//       return res.status(404).json({ error: "Group not found" });
//     }

//     return res.json({
//       success: true,
//       message: "Left group successfully",
//       leaveGroupResult,
//     })

    
//   } catch (error) {
//     console.log("Internal Error in leave group:", error);
    
//   }
// }


