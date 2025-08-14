import axios from "axios";
import users from "../config/Database.js";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/images/Cloudinary.js";
// function generateOTP() {
//   return Math.floor(1000 + Math.random() * 9000).toString();
// }

export const otpSend = async (req, res) => {
  try {
    const { phone_number } = req.params;
    console.log("Sending OTP...", phone_number);
    if (!phone_number)
      return res.status(400).json({ error: "Phone number is required" });

    const otp_store = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000); // 5 min expiry

    // Store OTP in DB
    await users.query(
      "INSERT INTO users (phone_number, otp_store, expires_at) VALUES (?, ?, ?)",
      [phone_number, otp_store, expiresAt]
    );
 //check user already exists update otp so user can login again

    const [userRows] = await users.execute(
      "SELECT * FROM users WHERE phone_number = ?",
      [phone_number]
    );

    // if (userRows.length) {
    //   // User exists -> update OTP so they can log in again
    //   await users.execute(
    //     "UPDATE users SET otp_store = ? WHERE phone_number = ?",
    //     [otp_store, phone_number]
    //   );

    //   // If no OTP row exists (maybe deleted earlier), insert new one
    //   if (
    //     (
    //       await users.execute("SELECT 1 FROM users WHERE phone_number = ?", [
    //         phone_number,
    //       ])
    //     )[0].length === 0
    //   ) {
    //     await users.execute(
    //       "INSERT INTO users (phone_number, otp_store, expires_at) VALUES (?, ?, ?)",
    //       [phone_number, otp_store, expires_at]
    //     );
    //   }
    // } else {
    //   // New user -> insert into OTP table
    //   await users.execute(
    //     "INSERT INTO otp_store (phone_number, otp, expires_at) VALUES (?, ?, ?)",
    //     [phone_number, otp_store, expires_at]
    //   );
    // }


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
  "UPDATE users SET status = 'Online' WHERE phone_number = ?",
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

// export const otpVerify = async (req, res) => {
//   try {
//     // const { otp_store } = req.body;
//     const { phone_number, otp_store } = req.params;

//     if (!phone_number || !otp_store)
//       return res.status(400).json({ error: "phone number & OTP required" });

//     // Fetch OTP from DB
//     // Fetch OTP for given phone number
//     const [rows] = await users.execute(
//       "SELECT * FROM users WHERE phone_number = ? AND otp_store = ? ORDER BY id DESC LIMIT 1",
//       [phone_number, otp_store]
//     );

//     if (!rows.length) {
//       return res.status(400).json({ error: "Phone number not found" });
//     }

//     if (String(rows[0].otp_store) !== String(otp_store)) {
//       return res.status(400).json({ error: "Invalid OTP" });
//     }

//     if (new Date(rows[0].expires_at) < new Date()) {
//       return res.status(400).json({ error: "OTP expired" });
//     }

//     // ✅ OTP verified, save user phone_number in `users` table
//     await users.execute("INSERT IGNORE INTO users (phone_number) VALUES (?)", [
//       phone_number,
//     ]);

//     // delete OTP after verification
//     const [result] = await users.execute(
//        "UPDATE users SET otp_store = NULL, expires_at = NULL WHERE phone_number = ?",
//       [phone_number]
//     );

//     if (result.affectedRows === 0) {
//       console.error("Failed to delete OTP");
//     }

//     // Emit Online status instantly
//     if (global.io) {
//       global.io.emit("status_update", { userId: rows[0].phone_number, status: "Online" });
//     }


// // // When user logs out or disconnects
// // await users.execute(
// //   "UPDATE users SET status = 'Last_Seen', last_seen_at = NOW() WHERE phone_number = ?",
// //   [phone_number]
// // );

// // // When user is manually set to Offline (no timestamp)
// // await users.execute(
// //   "UPDATE users SET status = 'Offline', last_seen_at = NULL WHERE phone_number = ?",
// //   [phone_number]
// // );

//     res.json({ success: true, message: "User verified successfully" , data: { phone_number } });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Verification failed" });
//   }
// };

export const otpVerify = async (req, res) => {
  try {
    const { phone_number, otp_store } = req.params;

    if (!phone_number || !otp_store)
      return res.status(400).json({ error: "phone number & OTP required" });

    // Fetch OTP from DB
    const [rows] = await users.execute(
      "SELECT * FROM users WHERE phone_number = ? AND otp_store = ? ORDER BY id DESC LIMIT 1",
      [phone_number, otp_store]
    );

    if (!rows.length)
      return res.status(400).json({ error: "Phone number not found" });

    if (String(rows[0].otp_store) !== String(otp_store))
      return res.status(400).json({ error: "Invalid OTP" });

    if (new Date(rows[0].expires_at) < new Date())
      return res.status(400).json({ error: "OTP expired" });

    // ✅ OTP verified, update DB status to Online
    await users.execute(
      "UPDATE users SET status = 'Online', last_seen_at = NULL, otp_store = NULL, expires_at = NULL WHERE phone_number = ?",
      [phone_number]
    );

    // Emit Online status instantly via Socket.IO
    if (global.io) {
      global.io.emit("status_update", {
        phone_number,
        status: "Online"
      });
    }

    // Generate token for user
    const token = jwt.sign({ phone_number, status: "Online" }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.json({
      success: true,
      message: "User verified successfully",
      data: { phone_number, token }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
};


export const setName = async (req,res) =>{
  try {
    const { username } = req.body;
    const phone_number = req.user.phone_number;

    if (!username) {
      return res.status(400).json({ error: "Name is required" });
    }

    await users.execute(
      "UPDATE users SET username = ? WHERE phone_number = ?",
      [username, phone_number]
    );

    res.json({ success: true, message: "Name added successfully" });
  } catch (error) {
    console.error("Error updating name:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}


export const uploadImage = async (req, res) => {
  try {
    const file = req.file;

    if(!file){
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "Profile",
      public_id: file.filename,
    });

    // Save image URL to user profile in DB
    await users.execute(
      "UPDATE users SET profile_picture = ? WHERE phone_number = ?",
      [result.secure_url, req.user.phone_number]
    );

    res.json({ success: true, message: "Image uploaded successfully", data: { url: result.secure_url } });
  } catch (error) {
    console.log("Error uploading image:", error);
    res.status(500).json({ error: "Failed to upload image" });
    
  }
}


export const getUserProfile = async (req, res) => {
  try {
    const phone_number = req.user.phone_number;

    const [rows] = await users.execute(
      "SELECT phone_number, username, profile_picture FROM users WHERE phone_number = ?",
      [phone_number]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
}


export const logout = async (req, res) => {
  try {
    if (!req.user || !req.user.phone_number) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const phone_number = req.user.phone_number;

    // Clear cookie if using cookie-based auth
    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "Strict" });

    // Update user status in DB
    await users.execute(
      "UPDATE users SET status = 'Offline', last_seen_at = NOW() WHERE phone_number = ?",
      [phone_number]
    );

    // Notify relevant clients via Socket.IO
    if (global.io) {
      try {
        // If you have user-specific rooms
        global.io.to(`status_room_${phone_number}`).emit("status_update", {
          phone_number,
          status: "Offline"
        });
      } catch (socketError) {
        console.error("Socket emit failed:", socketError);
      }
    }

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ error: "Failed to log out" });
  }
};