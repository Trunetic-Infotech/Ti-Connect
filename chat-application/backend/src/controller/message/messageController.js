import chat_messages from "../../config/Database.js";
import { getReceiverSocketId, io } from "../../utils/socket/socket.js";

export const SendMessage = async (req, res) => {
  try {
    const { sender_id } = req.params;
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
    const { receiver_id } = req.params;
    const myId = req.user.id

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

//delete message
export const DeleteMessage = async (req, res) => {
  try {
    const  id  = req.user.id;

    if(!id){
      res.status(400).json({ error: "Message ID is required" });
      return;
    }

    await chat_messages.execute(
      "DELETE FROM messages WHERE id = ?",
      [id]
    );

    // Notify the receiver via Socket.IO
    const receiverSocketId = getReceiverSocketId(receiver_id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message_deleted", { id });
    }

    res.json({ success: true, message: "Message deleted successfully" });

  } catch (error) {
    console.log("Error in Delete Message",error);
    res.status(500).json({ error: "Failed to delete message" });
    
  }
}