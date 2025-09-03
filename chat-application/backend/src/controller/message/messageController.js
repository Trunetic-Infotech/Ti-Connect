import chat_messages from "../../config/Database.js";
import cloudinary from "../../utils/images/Cloudinary.js";
import { getReceiverSocketId, io } from "../../utils/socket/socket.js";

export const SendMessage = async (req, res) => {
  try { 
    const { sender_id } = req.user.id;
    const { receiver_id, message, message_type = "text" } = req.body;

    if (!sender_id || !receiver_id || !message) {
      return res
        .status(400)
        .json({ error: "Sender ID, Receiver ID, and message are required" });
    }

    // Save message to database
    await chat_messages.execute(
      "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
      [sender_id, receiver_id, message]
    );

    const newMessage = {
      id: result.insertId,
      sender_id,
      message,
      message_type,
      created_at: new Date(),
    };

    // Send real-time update via Socket.IO
  const receiverSocketId = getReceiverSocketId(receiver_id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({ success: true, message: "Message sent successfully", newMessage });
  } catch (error) {
    console.log("error is Sending message", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

//get messages
export const GetMessages = async (req, res) => {
  try {
    const myId = req.user.id
    const { receiver_id } = req.body;

    if (!receiver_id) {
      return res.status(400).json({ error: "Receiver ID is required" });
    }

    const [rows] = await chat_messages.execute(
      `SELECT * FROM messages 
   WHERE (sender_id = ? AND receiver_id = ?) 
      OR (sender_id = ? AND receiver_id = ?) 
   ORDER BY created_at ASC`,
      [myId, receiver_id, receiver_id, myId]
    );

    res.json({
      success: true,
      messages: rows,
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
};


//update message
export const UpdateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, message_type = null, media_url = null } = req.body;

    if (!id || !message) {
      return res
        .status(400)
        .json({ error: "Message ID and message content are required" });
    }

    // Get receiver_id before updating (so we know who to notify)
    const [existingMessageRows] = await chat_messages.execute(
      "SELECT receiver_id, sender_id FROM messages WHERE id = ?",
      [id]
    );

    if (existingMessageRows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    const { receiver_id, sender_id } = existingMessageRows[0];

    // Update the message in DB
    await chat_messages.execute(
      "UPDATE messages SET message = ?, message_type = ?, media_url = ? WHERE id = ?",
      [message, message_type, media_url, id]
    );

    const updatedMessage = {
      id,
      sender_id,
      receiver_id,
      message,
      message_type,
      media_url,
    };

    // Notify the receiver via Socket.IO
    const receiverSocketId = getReceiverSocketId(receiver_id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message_updated", updatedMessage);
    }

    res.json({
      success: true,
      message: "Message updated successfully",
      updatedMessage,
    });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ error: "Failed to update message" });
  }
};

//delete message messages and media file also 
export const DeleteMessage = async (req, res) => {
  try {
    const { messageId } = req.body;  // <-- message ID from request body
    const userId = req.user.id;      // <-- logged-in user's ID

    if (!messageId) {
      return res.status(400).json({ error: "Message ID is required" });
    }

    // 1. Fetch message first (before deleting)
    const [rows] = await chat_messages.execute(
      "SELECT media_url, receiver_id FROM messages WHERE id = ? AND sender_id = ?",
      [messageId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Message not found or not owned by user" });
    }

    const { media_url, receiver_id } = rows[0];

    // 2. Delete the message from DB
    await chat_messages.execute(
      "DELETE FROM messages WHERE id = ?",
      [messageId]
    );

    // 3. Delete media from Cloudinary if exists
    if (media_url) {
      // Extract public_id from Cloudinary URL
      const parts = media_url.split("/");
      const filename = parts.pop(); // last part of URL
      const publicId = filename.split(".")[0]; // remove file extension
      await cloudinary.uploader.destroy(publicId);
    }

    // 4. Notify receiver via Socket.IO
    const receiverSocketId = getReceiverSocketId(receiver_id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message_deleted", { id: messageId });
    }

    return res.json({ success: true, message: "Message deleted successfully" });

  } catch (error) {
    console.error("Error in DeleteMessage:", error);
    return res.status(500).json({ error: "Failed to delete message" });
  }
};


//upload video files 
export const UploadMedia = async (req, res) => {
  try {
    const { sender_id } = req.params;
    const { media_url, message_type = "file", receiver_id } = req.body;

    if (!media_url || !receiver_id || !sender_id) {
      return res.status(400).json({ error: "Sender, receiver, and media are required" });
    }

    // Upload the media file to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(media_url, {
      resource_type: "auto", // auto-detect image/video/raw
      folder: "ChatMedia",   // optional: group all chat uploads
      public_id: `${Date.now()}-${sender_id}`, // optional: readable unique ID
    });

    // Save message to database (optional but usually needed)
    const [result] = await chat_messages.execute(
      "INSERT INTO messages (sender_id, receiver_id, message, media_url, message_type) VALUES (?, ?, ?, ?, ?)",
      [sender_id, receiver_id, null, uploadResponse.secure_url, message_type]
    );

    const newMessage = {
      id: result.insertId,
      sender_id,
      receiver_id,
      message: null,
      message_type,
      media_url: uploadResponse.secure_url,
      created_at: new Date(),
    };

    // Notify the receiver via Socket.IO
    const receiverSocketId = getReceiverSocketId(receiver_id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({
      success: true,
      message: "Media uploaded successfully",
      newMessage,
    });
  } catch (error) {
    console.error("Error uploading media:", error);
    res.status(500).json({ error: "Failed to upload media" });
  }
};


