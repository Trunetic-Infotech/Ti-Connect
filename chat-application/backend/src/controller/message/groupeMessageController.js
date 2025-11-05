import group_messages from "../../config/Database.js";
import group_members from "../../config/Database.js";
import create_groups from "../../config/Database.js";
import cloudinary from "../../utils/images/Cloudinary.js";
import { io } from "../../utils/socket/socket.js";

// Send a message to a group
export const SendGroupMessage = async (req, res) => {
  try {
    const sender_id = req.user.id;
    const {
      groupId,
      message = null,
      message_type = "text" || "contact",
      contact_details = null,
      media_url = null,
    } = req.body;

    console.log("asasdas", req.body);

    // 🧩 Validation
    if (!groupId) {
      return res
        .status(400)
        .json({ success: false, error: "Group ID is required" });
    }

    // ✅ Check if group exists
    const [groupInfo] = await create_groups.execute(
      "SELECT admin_id FROM create_groups WHERE id = ?",
      [groupId]
    );

    if (!groupInfo.length) {
      return res.status(404).json({ success: false, error: "Group not found" });
    }

    const isAdmin = groupInfo[0].admin_id === sender_id;

    // ✅ Check if user is a member (if not admin)
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

    // 📝 Prepare message data
    const msgText = message || null;
    const contactData =
      contact_details && typeof contact_details === "object"
        ? JSON.stringify(contact_details)
        : contact_details;

    // ✅ Save message in DB
    const [result] = await group_messages.execute(
      "INSERT INTO group_messages (group_id, sender_id, message, message_type, contact_details, media_url) VALUES (?, ?, ?, ?, ?, ?)",
      [groupId, sender_id, msgText, message_type, contactData, media_url]
    );

    // ✅ Construct new message object
    const newGroupMessage = {
      id: result.insertId,
      sender_id,
      group_id: groupId,
      message: msgText,
      message_type,
      contact_details: contact_details || null,
      media_url: media_url || null,
      created_at: new Date(),
      isSender: true,
    };

    // ✅ Emit message via Socket.IO to all group members
    io.to(`group_${groupId}`).emit("groupNewMessage", newGroupMessage);
    console.log(`📡 Emitted message to group_${groupId}`, newGroupMessage);

    // ✅ Send response
    return res.json({
      success: true,
      newGroupMessage,
    });
  } catch (error) {
    console.error("❌ Error sending group message:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to send group message" });
  }
};

export const SendGroupMessageUploadController = async (req, res) => {
  // console.log(req.file);
  // console.log(req.files);
  // console.log("Hello");
  // console.log(req.user);
  // console.log(req.body);

  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }
    // console.log(req.files);

    // Determine media type
    const getType = (file) => {
      if (file.mimetype.startsWith("image/")) return "image";
      if (file.mimetype.startsWith("video/")) return "video";
      if (file.mimetype.startsWith("audio/")) return "audio";
      if (file.mimetype === "application/pdf" || file.mimetype === "image/pdf")
        return "document";
      if (file.mimetype === "contact") return "contact";
      return "file";
    };

    const fileTypes = req.files.map(getType);
    const hasVideo = fileTypes.includes("video");
    const hasAudio = fileTypes.includes("audio");
    // console.log(fileTypes[0]);

    // Restrict multiple video/audio uploads
    if ((hasVideo || hasAudio) && req.files.length > 1) {
      return res.status(400).json({
        error: "You can upload only one video or one audio file at a time.",
      });
    }
    const newGroupMessage = await group_messages.execute(
      `INSERT INTO group_messages (group_id, sender_id, message, message_type, media_url) VALUES (?, ?, ?, ?, ?)`,
      [req.body.groupId, req.user.id, null, fileTypes[0], req.files[0].path]
    );

    const uploadedFiles = req.files.map((file) => ({
      url: file.path, // for Cloudinary: use file.path or file.secure_url
      type: file.mimetype,
      filename: file.filename,
    }));

     io.to(`group_${req.body.groupId}`).emit("groupNewMessage", newGroupMessage);
    console.log(`📡 Emitted message to group_${req.body.groupId}`, newGroupMessage);

    return res.status(200).json({
      success: true,
      message: "File(s) uploaded successfully",
      fileUrl: uploadedFiles[0].url, // for single upload
      files: uploadedFiles, // keep all if you need multi-upload later
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

    io.to(`group_${groupId}`).emit("GroupMessageUpdated", GroupMessageUpdated);
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

    io.to(`group_${groupId}`).emit("DeleteGroupMessage", DeleteGroupMessage);
    console.log(`📡 Emitted message to group_${groupId}`, DeleteGroupMessage);

    res.json({ success: true, message: "Group message deleted successfully" });
  } catch (error) {
    console.log("❌ Error deleting group message:", error);
    res.status(500).json({ error: "Failed to delete group message" });
  }
};
