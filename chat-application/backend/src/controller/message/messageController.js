import chat_messages from "../../config/Database.js";
import users from "../../config/Database.js";
import cloudinary from "../../utils/images/Cloudinary.js";
import { getReceiverSocketId, io } from "../../utils/socket/socket.js";
import CryptoJS from "crypto-js";
export const SendMessage = async (req, res) => {
  try {
    const sender_id = req.user.id; // ✅ fix destructuring

    const { receiver_id, message, message_type = "text", media_url,duration ,is_read, status, contact_details } = req.body;

    // console.log("data",sender_id);

    // console.log("Message data:", req.body);

    if (!sender_id || !receiver_id || !message_type) {
      return res
        .status(400)
        .json({
          error: "Sender ID, Receiver ID, and message type are required",
        });
    }

    //Encrypt message Text or contact details other types `media_url` will be used as it is
    let encryptedMessage = null;
    let encryptedContactDetails = null;
    const encryptionKey = process.env.MESSAGE_ENCRYPTION_KEY || 'default_key';

    if (message_type === 'text' && message) {
      encryptedMessage = CryptoJS.AES.encrypt(message, encryptionKey).toString();
    }

    if (message_type === 'contact' && contact_details) {
      encryptedContactDetails = CryptoJS.AES.encrypt(JSON.stringify(contact_details), encryptionKey).toString();
    }

    // Save message to database
    const [result] = await chat_messages.execute(
      "INSERT INTO chat_messages (sender_id, receiver_id, message, message_type, media_url,duration ,is_read, status,contact_details) VALUES (?,?, ?, ?, ? , ? , ?, ?, ?)",
      [sender_id, receiver_id, encryptedMessage || null, message_type, media_url || null, duration || null, is_read || 0, status || 'sent', contact_details || null]
    );

    const newMessage = {
      id: result.insertId,
      sender_id,
      receiver_id,
      message : encryptedMessage || null,
      message_type,
      media_url: media_url || null,
      duration: duration || null,
      is_read: 0,
      created_at: new Date(),
      status: status || "sent",
      contact_details : encryptedContactDetails || null,
    };

       // Optionally include decrypted message for sender’s UI
    if (message_type === "text") newMessage.message = message;
    if (message_type === "contact") newMessage.contact_details = contact_details;

    // ✅ Update sender last_seen_at (active while messaging)
    await users.execute("UPDATE users SET last_seen_at = NOW() WHERE id = ?", [
      sender_id,
    ]);

    // Emit to receiver if online  Send to receiver
    const receiverSocketId = getReceiverSocketId(receiver_id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    console.log("Receiver Socket ID:", receiverSocketId);

    res.json({
      success: true,
      message: "Message sent successfully",
      newMessage,
    });
  } catch (error) {
    console.log("❌ Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

export const MarkMessageDelivered = async (req, res) => {
  try {
    const { messageId } = req.params;

    // Update status in DB
    await chat_messages.execute(
      "UPDATE chat_messages SET status = 'delivered' WHERE id = ?",
      [messageId]
    );

    const [rows] = await chat_messages.execute(
      "SELECT * FROM chat_messages WHERE id = ?",
      [messageId]
    );
    const message = rows[0];
    // console.log(message);
    

    // Get sender socket
    const senderSocketId = getReceiverSocketId(message.sender_id); // ✅ fixed
    if (senderSocketId) {
      io.to(senderSocketId).emit("message_status_update", {
        message_id: message.id,
        status: "delivered",
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.log("Error marking delivered:", error);
    res.status(500).json({ error: "Failed to mark delivered" });
  }
};


export const MarkMessageRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    await chat_messages.execute(
      "UPDATE chat_messages SET status = 'read', is_read = 1 WHERE id = ?",
      [messageId]
    );

    const [rows] = await chat_messages.execute(
      "SELECT * FROM chat_messages WHERE id = ?",
      [messageId]
    );

        if (!rows || rows.length === 0) {
      console.warn(`⚠️ No message found with id ${messageId}`);
      return res.status(404).json({ error: "Message not found" });
    }

    const message = rows[0];
   
    // console.log(message);
    
    const senderSocketId = getReceiverSocketId(message.sender_id);
    if (senderSocketId) {
      io.to(senderSocketId).emit("message_status_update", {
        messageId: message.id,
        status: "read",
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.log("Error marking read:", error);
    res.status(500).json({ error: "Failed to mark read" });
  }
};


export const GetMessages = async (req, res) => {
  try {
    const myId = req.user.id;
    const { receiver_id } = req.query; // use query params for GET
    // console.log(receiver_id, myId);

    if (!receiver_id) {
      return res.status(400).json({ error: "Receiver ID is required" });
    }
    if (Number(receiver_id) === Number(myId)) {
      return res
        .status(400)
        .json({ error: "Cannot fetch messages with yourself" });
    }



    const [rows] = await chat_messages.execute(
      `SELECT m.*, 
              sender.username AS sender_name, sender.profile_picture AS sender_image,
              receiver.username AS receiver_name, receiver.profile_picture AS receiver_image
       FROM chat_messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users receiver ON m.receiver_id = receiver.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) 
          OR (m.sender_id = ? AND m.receiver_id = ?) 
       ORDER BY m.created_at ASC`,
      [myId, receiver_id, receiver_id, myId]
    );

    // console.log("messages ",rows);
        const encryptionKey = process.env.MESSAGE_ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error("Missing MESSAGE_ENCRYPTION_KEY ");
    }

        const messages = rows.map((msg) => {
      let decryptedMessage = msg.message;
      let decryptedContact = msg.contact_details;

      try {
        // 🔓 Decrypt text messages
        if (msg.message_type === "text" && msg.message) {
          const bytes = CryptoJS.AES.decrypt(msg.message, encryptionKey);
          decryptedMessage = bytes.toString(CryptoJS.enc.Utf8) || null;
        }

        // 🔓 Decrypt contact details
        if (msg.message_type === "contact" && msg.contact_details) {
          const bytes = CryptoJS.AES.decrypt(msg.contact_details, encryptionKey);
          const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
          decryptedContact = decryptedString
            ? JSON.parse(decryptedString)
            : null;
        }
      } catch (error) {
        console.error("Decryption error for message ID:", msg.id, error);
      }

      return {
        id: msg.id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        message: decryptedMessage,
        message_type: msg.message_type,
        media_url: msg.media_url,
        duration: msg.duration,
        is_read: msg.is_read,
        created_at: new Date(msg.created_at).toISOString(),
        sender_name: msg.sender_name,
        sender_image: msg.sender_image,
        receiver_name: msg.receiver_name,
        receiver_image: msg.receiver_image,
        status: msg.status,
        contact_details: decryptedContact,
      };
    });

    // console.log(messages);
    

    // Send to receiver
    const receiverSocketId = getReceiverSocketId(receiver_id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", messages);
    }
    io.emit("send_message", messages);

    // console.log("kjdfhnsd",messages);
    // console.log("Decrypted messages being sent:", messages.slice(-2));

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
};

//update message
export const UpdateMessage = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ Logged-in user ID
    const {  message, message_type = "text" } = req.body;
    const {messageId} = req.params;
    
    // console.log(req.body);
    

    if (!messageId || !message) {
      return res
        .status(400)
        .json({ error: "Message ID and message content are required" });
    }

    // ✅ Fetch the existing message to verify sender
    const [rows] = await chat_messages.execute(
      "SELECT receiver_id, sender_id FROM chat_messages WHERE id = ?",
      [messageId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    const { receiver_id, sender_id } = rows[0];

    // ✅ Only sender can edit their own message
    if (sender_id !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to edit this message" });
    }
 
    // 🔐 Encrypt updated message
    const encryptionKey = process.env.MESSAGE_ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error("Missing MESSAGE_ENCRYPTION_KEY in .env");
    }

    let encryptedMessage = null;

    if (message_type === "text" && message) {
      encryptedMessage = CryptoJS.AES.encrypt(message, encryptionKey).toString();
    } else {
      encryptedMessage = message; // for non-text types, just store as is
    }


    // ✅ Update message
    await chat_messages.execute(
      "UPDATE chat_messages SET message = ?, message_type = ? WHERE id = ?",
      [message, message_type, messageId]
    );

    const updatedMessage = {
      id: messageId,
      sender_id,
      receiver_id,
      message,
      message_type,
    };

    // ✅ Notify receiver in real time via Socket.IO
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
    const { messageId } = req.params;
    const userId = req.user.id;

    if (!messageId) {
      return res.status(400).json({ error: "Message ID is required" });
    }

    // 1. Get the message
    const [rows] = await chat_messages.execute(
      "SELECT media_url, receiver_id FROM chat_messages WHERE id = ? AND sender_id = ?",
      [messageId, userId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Message not found or not owned by user" });
    }

    const { media_url, receiver_id } = rows[0];

    // 2. Delete from DB
    await chat_messages.execute("DELETE FROM chat_messages WHERE id = ?", [
      messageId,
    ]);

    // 3. Delete from Cloudinary if needed
    if (media_url) {
      const parts = media_url.split("/");
      const filename = parts.pop();
      const publicId = filename.split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // 4. Notify both users via Socket.IO
    const receiverSocketId = getReceiverSocketId(receiver_id);
    const senderSocketId = getReceiverSocketId(userId);

    const payload = {
      messageId: Number(messageId),
      sender_id: userId,
      receiver_id,
    };
    
    // console.log(receiverSocketId, senderSocketId);
    

    // 🔥 Emit event to both sender and receiver (camelCase event)
    if (receiverSocketId) io.to(receiverSocketId).emit("messageDeleted", payload);
    if (senderSocketId) io.to(senderSocketId).emit("messageDeleted", payload);

    return res.json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error in DeleteMessage:", error);
    return res.status(500).json({ error: "Failed to delete message" });
  }
};

export const UploadMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    // console.log(req.files);
    

    // Determine media type
    const getType = (file) => {
      if (file.mimetype.startsWith("image/")) return "image";
      if (file.mimetype.startsWith("video/")) return "video";
      if (file.mimetype.startsWith("audio/")) return "voice";
      if (file.mimetype === "application/pdf" || file.mimetype === "image/pdf") return "document";
      if (file.mimetype === "text/contact") return "text";
      return "file";
    };

    const fileTypes = req.files.map(getType);
    const hasVideo = fileTypes.includes("video");
    const hasAudio = fileTypes.includes("voice");

    // Restrict multiple video/audio uploads
    if ((hasVideo || hasAudio) && req.files.length > 1) {
      return res.status(400).json({
        error: "You can upload only one video or one audio file at a time.",
      });
    }

    const uploadedFiles = req.files.map((file) => ({
      url: file.path,      // for Cloudinary: use file.path or file.secure_url
      type: file.mimetype,
      filename: file.filename,
    }));

    return res.status(200).json({
      success: true,
      message: "File(s) uploaded successfully",
      fileUrl: uploadedFiles[0].url, // for single upload
      files: uploadedFiles,          // keep all if you need multi-upload later
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};










































