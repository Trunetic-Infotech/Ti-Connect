import  group_messages  from "../../config/Database.js";
import  group_members  from "../../config/Database.js";
import  create_groups  from "../../config/Database.js";
import cloudinary from "../../utils/images/Cloudinary.js";
import { io } from "../../utils/socket/socket.js";
import { getReceiverSocketId } from "../../utils/socket/socket.js";    

// Send a message to a group  members
// export const SendGroupMessage = async (req, res) => {
//   try {
//     const sender_id = req.user.id; // current logged-in user
//     const { groupId, message, message_type = "text" } = req.body;

//     if (!groupId || !message) {
//       return res.status(400).json({ error: "Group ID and message are required" });
//     }

//     // 🔹 First check if user is admin of the group
//     const [groupInfo] = await create_groups.execute(
//       "SELECT admin_id FROM create_groups WHERE id = ?",
//       [groupId]
//     );

//     if (groupInfo.length === 0) {
//       return res.status(404).json({ error: "Group not found" });
//     }

//     const isAdmin = groupInfo[0].admin_id === sender_id;

//     // 🔹 If not admin, check membership
//     let isMember = false;
//     if (!isAdmin) {
//       // Check block
//       const [blockedRows] = await group_members.execute(
//         "SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND Block_Group = ?",
//         [groupId, sender_id, "block"]
//       );
//       if (blockedRows.length > 0) {
//         return res.status(403).json({ error: "You are blocked in this group" });
//       }

//       // Check left
//       const [leftRows] = await group_members.execute(
//         "SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND Leave_Group = ?",
//         [groupId, sender_id, 1]
//       );
//       if (leftRows.length > 0) {
//         return res.status(403).json({ error: "You have left this group" });
//       }

//       // Check membership
//       const [groupRows] = await group_members.execute(
//         "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
//         [groupId, sender_id]
//       );
//       isMember = groupRows.length > 0;
//     }

//     // ✅ Allow if admin OR member
//     if (!isAdmin && !isMember) {
//       return res.status(403).json({ error: "You are not a member of this group" });
//     }

//     // 🔹 Save message
//     const [result] = await group_messages.execute(
//       "INSERT INTO group_messages (group_id, sender_id, message, message_type) VALUES (?, ?, ?, ?)",
//       [groupId, sender_id, message, message_type]
//     );

//     const newGroupMessage = {
//       id: result.insertId,
//       sender_id: sender_id,
//       group_id: groupId,
//       message,
//       message_type,
//       created_at: new Date(),
//     };
  
//     // 🔹 Emit to all group members except sender
//     io.to(`group_${groupId}`).emit("groupNewMessage", newGroupMessage);
//    console.log("Emitted to group:", `group_${groupId}`, newGroupMessage);
        

//     res.json({
//       success: true,
//       message: "Group message sent successfully",
//       newGroupMessage,
//     });
//   } catch (error) {
//     console.log("❌ Error sending group message:", error);
//     res.status(500).json({ error: "Failed to send group message" });
//   }
// };

export const SendGroupMessage = async (req, res) => {
  try {
    const sender_id = req.user.id;
    const { groupId, message, message_type = "text" } = req.body;

    if (!groupId || !message) {
      return res.status(400).json({ error: "Group ID and message are required" });
    }

    // ✅ Check if group exists
    const [groupInfo] = await create_groups.execute(
      "SELECT admin_id FROM create_groups WHERE id = ?",
      [groupId]
    );

    if (!groupInfo.length) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isAdmin = groupInfo[0].admin_id === sender_id;

    // ✅ Check membership for non-admin
    let isMember = false;
    if (!isAdmin) {
      const [membership] = await group_members.execute(
        "SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND Block_Group != 'block' AND Leave_Group != 1",
        [groupId, sender_id]
      );
      isMember = membership.length > 0;
    }

    if (!isAdmin && !isMember) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    // ✅ Save message in DB
    const [result] = await group_messages.execute(
      "INSERT INTO group_messages (group_id, sender_id, message, message_type) VALUES (?, ?, ?, ?)",
      [groupId, sender_id, message, message_type]
    );

    const newGroupMessage = {
      id: result.insertId,
      sender_id,
      group_id: groupId,
      message,
      message_type,
      created_at: new Date(),
    };

    // ✅ Emit message to group via Socket.IO
    io.to(`group_${groupId}`).emit("groupNewMessage", newGroupMessage);
    console.log(`Emitted message to room group ${groupId}`);  
     //  console.log(newGroupMessage); 
 
    res.json({
      success: true,
      message: "Group message sent successfully",
      newGroupMessage,
    });
  } catch (error) {
    console.error("❌ Error sending group message:", error);
    res.status(500).json({ error: "Failed to send group message" });
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
      return res.status(403).json({ error: "You are not a member of this group" });
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
    res.json({
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
//     const { groupId, page = 1, limit = 20 } = req.query;

//     console.log(`Fetching messages for group ID: ${groupId} by user ID: ${sender_id}, page: ${page}, limit: ${limit}`);

//     // ------------------------------
//     // ✅ Validate input
//     // ------------------------------
//     if (!groupId) {
//       return res.status(400).json({ error: "Group ID is required" });
//     }

//     // ------------------------------
//     // ✅ Check if the user is blocked in the group
//     // ------------------------------
//     const [blockedRows] = await group_members.execute(
//       `SELECT * 
//        FROM group_members 
//        WHERE group_id = ? AND user_id = ? AND Block_Group = ?`,
//       [groupId, sender_id, "block"]
//     );
//     if (blockedRows.length > 0) {
//       return res.status(403).json({ error: "You are blocked in this group" });
//     }

//     // ------------------------------
//     // ✅ Check if the user has left the group
//     // ------------------------------
//     const [leftRows] = await group_members.execute(
//       `SELECT * 
//        FROM group_members 
//        WHERE group_id = ? AND user_id = ? AND Leave_Group = ?`,
//       [groupId, sender_id, 1]
//     );
//     if (leftRows.length > 0) {
//       return res.status(403).json({ error: "You have left this group" });
//     }

//     // ------------------------------
//     // ✅ Check if the user is a member or the admin
//     // ------------------------------
//     const [groupRows] = await group_members.execute(
//       `SELECT gm.*, cg.admin_id
//        FROM create_groups cg
//        LEFT JOIN group_members gm 
//          ON gm.group_id = cg.id AND gm.user_id = ?
//        WHERE cg.id = ?`,
//       [sender_id, groupId]
//     );

//     if (groupRows.length === 0) {
//       return res.status(403).json({ error: "You are not a member of this group" });
//     }

//     const isAdmin = groupRows[0].admin_id === sender_id;
//     console.log("Group membership verified. Is Admin:", isAdmin);

//     // ------------------------------
//     // ✅ Pagination setup
//     // ------------------------------
//     const offset = (page - 1) * limit;

//     // ------------------------------
//     // ✅ Fetch paginated messages with sender details
//     // ------------------------------
//     const [messages] = await group_messages.execute(
//       `SELECT gm.*, u.username, u.profile_picture, u.status AS user_status
//        FROM group_messages gm
//        JOIN users u ON gm.sender_id = u.id
//        WHERE gm.group_id = ?
//        ORDER BY gm.created_at ASC
//        LIMIT ${limit}  OFFSET ${offset} `,
//       [groupId, parseInt(limit), parseInt(offset)]
//     );

//     // ------------------------------
//     // ✅ Add isSender flag for frontend
//     // ------------------------------
//     const formattedMessages = messages.map(msg => ({
//       ...msg,
//       isSender: msg.sender_id === sender_id
//     }));

//     // ------------------------------
//     // ✅ Respond with messages
//     // ------------------------------
//     res.json({
//       success: true,
//       isAdmin,
//       messages: formattedMessages,
//       page: parseInt(page),
//       limit: parseInt(limit),
//       totalMessages: messages.length
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
    const { id, groupId } = req.params;
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
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    const { sender_id, created_at } = existingMessageRows[0];

    // 🔹 Only sender can update
    if (sender_id !== userId) {
      return res.status(403).json({ error: "You can only update your own messages" });
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
    await group_messages.execute(
      "UPDATE group_messages SET message = ?, message_type = ? WHERE id = ?",
      [message, message_type, id]
    );

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
    const { id } = req.body;
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
      return res.status(403).json({ error: "You can only delete your own messages" });
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
          await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        } else if (message_type === "video") {
          await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
        }
      } catch (cloudErr) {
        console.log("❌ Error deleting media from Cloudinary:", cloudErr);
        // Continue deleting message even if Cloudinary fails
      }
    }

    // 🔹 Delete the message from the database
    await group_messages.execute("DELETE FROM group_messages WHERE id = ?", [id]);

    res.json({ success: true, message: "Group message deleted successfully" });
  } catch (error) {
    console.log("❌ Error deleting group message:", error);
    res.status(500).json({ error: "Failed to delete group message" });
  }
};










































































