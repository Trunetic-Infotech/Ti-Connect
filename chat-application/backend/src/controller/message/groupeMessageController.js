import { group_messages, group_members } from "../../config/Database.js";
import { io } from "../../utils/socket/socket.js";
import { getReceiverSocketId } from "../../utils/socket/socket.js";    

// Send a message to a group  members
export const SendGroupMessage = async (req, res) => {
  try {
    const sender_id = req.user.id; // current logged-in user
    const { groupId, message, message_type } = req.body;

    // Validate required fields
    if (!groupId || !message) {
      return res
        .status(400)
        .json({ error: "Group ID and message are required" });
    }

    // 🔹 Check if user is a member of the group
    const [groupRows] = await group_members.execute(
      "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
      [groupId, sender_id]
    );

    if (groupRows.length === 0) {
      return res
        .status(403)
        .json({ error: "You are not a member of this group" });
    }

    // 🔹 Save message to the database
    const [result] = await group_messages.execute(
      "INSERT INTO group_messages (group_id, sender_id, message, message_type) VALUES (?, ?, ?, ?)",
      [groupId, sender_id, message, message_type || "text"]
    );

    // Construct message object to send via Socket.IO
    const newGroupMessage = {
      id: result.insertId,
      sender_id,
      group_id: groupId,
      message,
      message_type: message_type || "text",
      created_at: new Date(),
    };

    
    // 🔹 Emit message to all users in the group room
    io.to(groupId).emit("group_message", newGroupMessage);

    // Respond to sender
    res.json({
      success: true,
      message: "Group message sent successfully",
      newGroupMessage,
    });
  } catch (error) {
    console.log("❌ Error sending group message:", error);
    res.status(500).json({ error: "Failed to send group message" });
  }
};

// Get messages for a specific group
export const GetGroupMessages = async (req, res) => {
  try {
    const userId = req.user.id; // current logged-in user
    const { groupId } = req.body;

    // Validate input
    if (!groupId) {
      return res.status(400).json({ error: "Group ID is required" });
    }

    // 🔹 Check if the user is a member of the group
    const [groupRows] = await group_members.execute(
      "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
      [groupId, userId]
    );

    if (groupRows.length === 0) {
      return res
        .status(403)
        .json({ error: "You are not a member of this group" });
    }

    // Fetch group messages
    const [messages] = await group_messages.execute(
      `SELECT * FROM group_messages
       WHERE group_id = ?
       ORDER BY created_at ASC`[groupId]
    );

    // Respond with messages
    res.json({ success: true, messages: messages });
  } catch (error) {
    console.log("❌ Error fetching group messages:", error);
    res.status(500).json({ error: "Failed to fetch group messages" });
  }
};

// Update a group message
export const UpdateGroupMessage = async (req, res) => {
  try {
    const userId = req.user.id; // current logged-in user
    const { id } = req.params;
    const { message, message_type = null, media_url = null } = req.body;

    if (!id || !message) {
      return res
        .status(400)
        .json({ error: "Message ID and message content are required" });
    }

    // 🔹 Check if the user is the sender of the message
    const [existingMessageRows] = await group_messages.execute(
      "SELECT sender_id FROM group_messages WHERE id = ?",
      [id]
    );
    if (existingMessageRows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    const { sender_id } = existingMessageRows[0];
    if (sender_id !== userId) {
      return res
        .status(403)
        .json({ error: "You can only update your own messages" });
    }

    // 🔹 Update the message in the database
    await group_messages.execute(
      "UPDATE group_messages SET message = ?, message_type = ?, media_url = ? WHERE id = ?",
      [message, message_type, media_url, id]
    );

    // Respond with success message
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
    // 🔹 Check if the user is the sender of the messagE
    
    const [existingMessageRows] = await group_messages.execute(
      "SELECT sender_id FROM group_messages WHERE id = ?",
      [id]
    );
    if (existingMessageRows.length === 0) {
        return res.status(404).json({ error: "Message not found" });
    }
    
    const { sender_id } = existingMessageRows[0];
    if (sender_id !== userId) {
      return res
        .status(403)
        .json({ error: "You can only delete your own messages" });
    }

    // 🔹 Delete the message from the database
    await group_messages.execute("DELETE FROM group_messages WHERE id = ?", [id]);

    // Respond with success message
    res.json({ success: true, message: "Group message deleted successfully" });
  } catch (error) {
    console.log("❌ Error deleting group message:", error);
    res.status(500).json({ error: "Failed to delete group message" });
  }
}; 










































































