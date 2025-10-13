import chat_messages from "../../config/Database.js";
import users from "../../config/Database.js";
import cloudinary from "../../utils/images/Cloudinary.js";
import { getReceiverSocketId, io } from "../../utils/socket/socket.js";

export const SendMessage = async (req, res) => {
  try {
    const sender_id = req.user.id; // ✅ fix destructuring
    console.log('====================================');
    console.log(req.body);
    console.log('====================================');
    const { receiver_id, message, message_type = "text", media_url,duration ,is_read } = req.body;

    // console.log("data",sender_id);

    // console.log("Message data:", req.body);

    if (!sender_id || !receiver_id || !message_type) {
      return res
        .status(400)
        .json({
          error: "Sender ID, Receiver ID, and message type are required",
        });
    }

    // Save message to database
    const [result] = await chat_messages.execute(
      "INSERT INTO chat_messages (sender_id, receiver_id, message, message_type, media_url,duration ,is_read) VALUES (?,?, ?, ?, ? , ? , ?)",
      [sender_id, receiver_id, message, message_type, media_url || null, duration || null, is_read || 0]
    );

    const newMessage = {
      id: result.insertId,
      sender_id,
      receiver_id,
      message,
      message_type,
      media_url: media_url || null,
      duration: duration || null,
      is_read: 0,
      created_at: new Date(),
    };

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

// get messages
// export const GetMessages = async (req, res) => {
//   try {
//     const myId = req.user.id;
//     const { receiver_id } = req.body;

//     if (!receiver_id) {
//       return res.status(400).json({ error: "Receiver ID is required" });
//     }

//     const [rows] = await chat_messages.execute(
//       `SELECT * FROM chat_messages
//    WHERE (sender_id = ? AND receiver_id = ?)
//       OR (sender_id = ? AND receiver_id = ?)
//    ORDER BY created_at ASC`,
//       [myId, receiver_id, receiver_id, myId]
//     );

//     res.json({
//       success: true,
//       messages: rows,
//     });
//   } catch (error) {
//     console.error("Error getting messages:", error);
//     res.status(500).json({ error: "Failed to get messages" });
//   }
// };

export const GetMessages = async (req, res) => {
  try {
    const myId = req.user.id;
    const { receiver_id } = req.query; // use query params for GET
    console.log(receiver_id, myId);

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

    const messages = rows.map((msg) => ({
      id: msg.id,
      sender_id: msg.sender_id,
      receiver_id: msg.receiver_id,
      message: msg.message,
      message_type: msg.message_type,
      media_url: msg.media_url,
      is_read: msg.is_read,
      created_at: new Date(msg.created_at).toISOString(),
      sender_name: msg.sender_name,
      sender_image: msg.sender_image,
      receiver_name: msg.receiver_name,
      receiver_image: msg.receiver_image,
    }));

    // Send to receiver
    const receiverSocketId = getReceiverSocketId(receiver_id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", messages);
    }
    io.emit("send_message", messages);

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
    const { messageId, message, message_type = "text" } = req.body;

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
    const { messageId } = req.body; // <-- message ID from request body
    const userId = req.user.id; // <-- logged-in user's ID

    if (!messageId) {
      return res.status(400).json({ error: "Message ID is required" });
    }

    // 1. Fetch message first (before deleting)
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

    // 2. Delete the message from DB
    await chat_messages.execute("DELETE FROM chat_messages WHERE id = ?", [
      messageId,
    ]);

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
// export const UploadMedia = async (req, res) => {
//   try {
//     const files = req.files; // Multer stores files here
//     console.log('====================================');
//     console.log("files", files);
//     console.log('====================================');

//     if (!files || files.length === 0) {
//       return res.status(400).json({ error: "No media files uploaded." });
//     }
 

//     // Determine media type
//     const getType = (file) => {
//       if (file.mimetype.startsWith("image/")) return "image";
//       if (file.mimetype.startsWith("video/")) return "video";
//       if (file.mimetype.startsWith("audio/")) return "voice";
//       if (file.mimetype.startsWith("application/")) return "document";
//       if (file.mimetype === "text/contact") return "text";
//       return "file";
//     };

//     const fileTypes = files.map(getType);
//     const hasVideo = fileTypes.includes("video");
//     const hasAudio = fileTypes.includes("voice");

//     // ❌ Restrict multiple video/audio uploads
//     if ((hasVideo || hasAudio) && files.length > 1) {
//       return res.status(400).json({
//         error: "You can upload only one video or one audio file at a time.",
//       });
//     }

//     // // ✅ Upload each file to Cloudinary
//     // const uploadedMedia = await Promise.all(
//     //   files.map(async (file) => {
//     //     const type = getType(file);

//     //     const uploadRes = await cloudinary.uploader.upload(file.path, {
//     //       resource_type: "auto",
//     //       folder: "ChatMedia",
//     //       public_id: `${Date.now()}-${sender_id}`,
//     //     });

//     //     const msg = message && message.trim() !== "" ? message : null;

//     //     const [result] = await chat_messages.execute(
//     //       "INSERT INTO chat_messages (sender_id, receiver_id, message, media_url, message_type) VALUES (?, ?, ?, ?, ?)",
//     //       [sender_id, receiver_id, msg, uploadRes.secure_url, type]
//     //     );

//         // return {
//         //   media_url: files.path,
//         // };
   

//     // Notify receiver via Socket.IO
//     // const receiverSocketId = getReceiverSocketId(receiver_id);
//     // if (receiverSocketId) {
//     //   uploadedMedia.forEach((m) =>
//     //     io.to(receiverSocketId).emit("newMessage", m)
//     //   );
//     // }

//     res.json({
//       success: true,
//       message: "Media uploaded successfully.",
//       fileUrl: files.map(f => f.path) 
//     });
//   } catch (error) {
//     console.error("Error uploading media:", error);
//     res.status(500).json({ error: "Failed to upload media" });
//   }
// };

// controllers/messageController.js
// export const UploadMedia = async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ success: false, message: "No file uploaded" });
//     }

//     const uploadedFiles = req.files.map((file) => ({
//       url: file.path,
//       type: file.mimetype,
//       filename: file.filename,
//     }));

//     return res.status(200).json({
//       success: true,
//       message: "File(s) uploaded successfully",
//       fileUrl: uploadedFiles[0].url, // for single upload
//       files: uploadedFiles,          // keep all if you need multi-upload later
//     });
//   } catch (err) {
//     console.error("Upload error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };




export const UploadMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

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










































