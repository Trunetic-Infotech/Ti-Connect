import axios from "axios";
import users from "../config/Database.js";
import chat_messages from "../config/Database.js";
import user_invite_links from "../config/Database.js"
import jwt from "jsonwebtoken";
import cloudinary from "../utils/images/Cloudinary.js";
import { io,getReceiverSocketId } from "../utils/socket/socket.js";
import crypto from "crypto";
export const otpSend = async (req, res) => {
  try {
    const { phone_number } = req.params;
    console.log("Sending OTP...", phone_number);
    if (!phone_number)
      return res.status(400).json({ error: "Phone number is required" });

    const otp_store = Math.floor(1000 + Math.random() * 9000).toString();
    const expires_at = new Date(Date.now() + 5 * 60000); // 5 min expiry

    // // Store OTP in DB
    // await users.query(
    //   "INSERT INTO users (phone_number, otp_store, expires_at) VALUES (?, ?, ?)",
    //   [phone_number, otp_store, expires_at]
    // );
    //check user already exists update otp so user can login again

    const [userRows] = await users.execute(
      "SELECT * FROM users WHERE phone_number = ?",
      [phone_number]
    );

    if (userRows.length) {
      // User exists -> update OTP so they can log in again
      await users.execute(
        "UPDATE users SET otp_store = ?, expires_at = ? WHERE phone_number = ?",
        [otp_store, expires_at, phone_number]
      );

      // // If no OTP row exists (maybe deleted earlier), insert new one
      // if (
      //   (
      //     await users.execute("SELECT 1 FROM users WHERE phone_number = ?", [
      //       phone_number,
      //     ])
      //   )[0].length === 0
      // ) {
      //   await users.execute(
      //     "INSERT INTO users (phone_number, otp_store, expires_at) VALUES (?, ?, ?)",
      //     [phone_number, otp_store, expires_at]
      //   );
      // }
    } else {
      // New user -> insert into OTP table
      await users.execute(
        "INSERT INTO users (phone_number, otp_store, expires_at) VALUES (?, ?, ?)",
        [phone_number, otp_store, expires_at]
      );
    }

    // Send SMS via Edumarc API

    const smsBody = {
      message: `Welcome to Trunetic! your secure OTP for registering on Application by Trunetic Infotech Private Limited is: ${otp_store}. This OTP expires in 5 minutes. Please enter it to finalize your registration. `,
      senderId: "TRNETC",
      number: [phone_number],
      templateId: process.env.Template_ID,
    };

    await axios.post("https://smsapi.edumarcsms.com/api/v1/sendsms", smsBody, {
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.EDUMARC_API_KEY,
      },
    });
    await users.execute(
      "UPDATE users SET status = 'active' WHERE phone_number = ?",
      [phone_number]
    );
    res.json({
      success: true,
      message: "OTP sent successfully",
      data: {
        phone_number,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

export const otpVerify = async (req, res) => {
  try {
    const { phone_number, otp_store } = req.params;
    console.log("OTP Verification:", { phone_number, otp_store });

    if (!phone_number || !otp_store)
      return res.status(400).json({ error: "phone number & OTP required" });

    // Fetch OTP from DB
    const [rows] = await users.execute(
      "SELECT * FROM users WHERE phone_number = ? AND otp_store = ? ",
      [phone_number, otp_store]
    );
    console.log("OTP Verification rrr Result:", rows[0]);

    if (!rows.length)
      return res.status(400).json({ error: "Phone number not found" });

    if (String(rows[0].otp_store) !== String(otp_store))
      return res.status(400).json({ error: "Invalid OTP" });

    if (new Date(rows[0].expires_at) < new Date())
      return res.status(400).json({ error: "OTP expired" });

    // ✅ OTP verified, update DB status to Online
    await users.execute(
      "UPDATE users SET status = 'active', last_seen_at = NULL, otp_store = NULL, expires_at = NULL WHERE phone_number = ?",
      [phone_number]
    );

    // Emit Online status instantly via Socket.IO
    // if (global.io) {
    //   global.io.emit("status_update", {
    //     phone_number,
    //     status: "Online"
    //   });
    // }
    // Emit Online status instantly
    const receiverSocketId = getReceiverSocketId(phone_number);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("status_update", {
        phone_number,
        status: "active",
      });
    }

    // Generate token for user
    const token = jwt.sign(
      { phone_number, status: "active", id: rows[0].id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      success: true,
      message: "User verified successfully",
      data: { phone_number, token },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Verification failed", err });
  }
};

export const setNameController = async (req, res) => {
  try {
    const user = req.user;
    const { username } = req.body;
    const id = user.id; // ✅ properly destructure

    if (!username) {
      return res.status(400).json({ error: "Name is required" });
    }

    const [result] = await users.execute(
      "UPDATE users SET username = ? WHERE id = ?",
      [username, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, message: "Name updated successfully" });
  } catch (error) {
    console.error("Error updating name:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const uploadImageController = async (req, res) => {
  try {
    const user = req.user;
    const id = user.id;
    console.log("User ", user);
    console.log("User Id", id);

    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "Profile",
      public_id: file.filename,
    });

    // Save image URL to DB
    await users.execute("UPDATE users SET profile_picture = ? WHERE id = ?", [
      result.secure_url,
      id,
    ]);

    res.json({
      success: true,
      message: "Image uploaded successfully",
      data: { url: result.secure_url },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
};


export const getUserNameAndProfilePictureController = async(req,res)=>{
  try {
    const id = req.user.id;
    console.log(id);

    const [user] = await users.execute(`Select * from users where id = ?`, [id])


    if(user.length === 0){
      return res.status(404).json({
        success: false,
        message: "User not Found",
      })
    }

    console.log(user);
    

    return res.status(200).json({
      success: true,
      message: "User Found",
      data: user
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({success: false, message: error.message || "Internal Server Error"});
    
  }
}

export const getUserProfileController = async (req, res) => {
  try {
    const id = req.user.id;

    const [rows] = await users.execute("SELECT * FROM users WHERE id = ?", [
      id,
    ]);

    if (!rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

export const logout = async (req, res) => {
  try {
    const phone_number = req.user?.phone_number;

    // If using express-session, destroy session first
    if (req.session) {
      req.session.destroy((err) => {
        if (err) console.error("Session destruction failed:", err);
      });
    }

    // Clear auth cookies (if used)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in prod
      sameSite: "Strict",
    };
    ["token", "connect.sid", "session"].forEach((cookie) => {
      res.clearCookie(cookie, cookieOptions);
    });

    // If using JWT in Authorization header, consider blacklisting token here

    // Notify via socket (broadcast)
    if (phone_number) {
      io.emit("status_update", {
        phone_number,
        status: "inactive",
      });
    }

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "Failed to log out" });
  }
};



// export const shareAndCheckcontact = async (req, res) => {
//   try {

//     const { io } = req.app;

//     const { phone_number } = req.body;

//     if (!phone_number) {
//       return res.status(400).json({ success: false, error: "Phone number is required" });
//     }

//     // Check if phone number exist or not if not create link  so its can we share to othere  user
//      const [rows] = await users.execute(
//       "SELECT id, username, phone_number, profile_picture FROM users WHERE phone_number = ?",
//       [phone_number]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({ success: false, error: "User not found" });
//     }else if(rows.length === 1){
//       //if user founded so sended message in chat_message
//       const chatMessage = {
//         sender_id: req.user.id,
//         receiver_id: rows[0].id,
//         message: "You have a new contact!",
//       };
//       await chat_messages.execute("INSERT INTO chat_messages SET ?", chatMessage);
//     }


    

//     const foundUser = rows[0];

//     // Get receiver socket id
//     const receiverSocketId = getReceiverSocketId(phone_number);
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("new_contact", {
//         fromUserId: req.user.id,  // sender
//         contact: foundUser,       // receiver contact details
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Contact shared successfully",
//       contact: foundUser,
//     });

//   } catch (error) {
//     console.error("Error in shareAndCheckContact:", error);
//     return res.status(500).json({ success: false, error: "Failed to share and check contact" });
//   }
// };



//get all connect user list 
export const getUsersForSidebar = async (req, res) => {
  try {
    const id = req.phone_number.id;
   const { userSocketMap } = req.app; // Access userSocketMap from app locals

    if (!id) {
      return res.status(401).json({ success: false, error: "User not authenticated" });
    }

    // Get all active users except the current one
    const [rows] = await users.execute(
      `SELECT id, username, phone_number, status FROM users WHERE status = 'Active' AND id != ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "No active users found" });
    }
      
    //checking previous connected if yes show also detail
    const userChatsExists = await chat_messages.execute(
      "SELECT * FROM chat_messages WHERE sender_id = ? OR receiver_id = ?",
      [id, id]
    );

    // Map user IDs to their chat details
    const userChatMap = new Map();
    userChatsExists.forEach(chat => {
      const otherUserId = chat.sender_id === id ? chat.receiver_id : chat.sender_id;
      if (!userChatMap.has(otherUserId)) {
        userChatMap.set(otherUserId, []);
      }
      userChatMap.get(otherUserId).push(chat);
    });

      // Build online user list (based on sockets)
    const onlineUserIds = new Set(Object.keys(userSocketMap)); // Faster lookup

    // Combine user data with online status
    const userList = rows.map(user => ({
      ...user,
      isOnline: onlineUserIds.has(user.id.toString()), // true/false
    }));

    // Return data to the client
    return res.status(200).json({
      success: true,
      message: "Active users retrieved successfully",
      data: userList,

    });

  } catch (error) {
    console.error("Error showing list of contacts:", error);
    return res.status(500).json({ success: false, error: "Failed to retrieve contacts" });
  }
};


export const shareAndCheckcontact = async (req, res) => {
  try {
    const { io } = req.app;
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({ success: false, error: "Phone number is required" });
    }

    // Check if phone number exists
    const [rows] = await users.execute(
      "SELECT id, username, phone_number, profile_picture FROM users WHERE phone_number = ?",
      [phone_number]
    );

    // Case 1: User not found → create share link
    if (rows.length === 0) {
      // Create a unique token for invitation
      const token = crypto.randomBytes(16).toString("hex");

      // You can create an invitation entry in DB (optional)-not mandatory
      await user_invite_links.execute(
        "INSERT INTO user_invite_links (user_id, phone_number, token) VALUES (?, ?, ?)",
        [req.user.id, phone_number, token]
      );

      // Generate shareable link (adjust base URL according to your frontend domain)
      const shareLink = `${process.env.APP_BASE_URL}/invite/${token}`;

      return res.status(200).json({
        success: true,
        message: "User not found. Share this link to invite the contact.",
        share_link: shareLink,
      });
    }

    // Case 2: User found → send chat message
    const foundUser = rows[0];
    const chatMessage = {
      sender_id: req.user.id,
      receiver_id: foundUser.id,
      message: "You have a new contact!",
    };

    await chat_messages.execute("INSERT INTO chat_messages SET ?", chatMessage);

    // Get receiver socket id
    const receiverSocketId = getReceiverSocketId(foundUser.phone_number);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("new_contact", {
        fromUserId: req.user.id, // sender
        contact: foundUser,      // receiver contact details
      });
    }

    return res.json({
      success: true,
      message: "Contact shared successfully",
      contact: foundUser,
    });

  } catch (error) {
    console.error("Error in shareAndCheckContact:", error);
    return res.status(500).json({ success: false, error: "Failed to share and check contact" });
  }
};