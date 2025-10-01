import { io } from "../../utils/socket/socket.js";
import users from "../../config/Database.js";
import group_members from "../../config/Database.js";
import create_groups from "../../config/Database.js";
import cloudinary from "../../utils/images/Cloudinary.js";
import group_messages from "../../config/Database.js";
import { getReceiverSocketId } from "./../../utils/socket/socket.js";

//create a group
export const CreateGroup = async (req, res) => {
  try {
    const { group_name, role = "Admin" } = req.body;
    const admin_id = req.user.id;

    if (!group_name) {
      return res.status(400).json({ error: "Group name is required" });
    }
    //optional picture
    const group_picture = req.file ? req.file.path : null;

    // check if group name already exists
    const [existingGroup] = await create_groups.execute(
      "SELECT * FROM create_groups WHERE group_name = ?",
      [group_name]
    );
    if (existingGroup.length > 0) {
      return res.status(400).json({ error: "Group name already exists" });
    }

    // ✅ upload picture if provided
    let groupImageUrl = null;
    if (group_picture) {
      const result = await cloudinary.uploader.upload(group_picture, {
        folder: "GroupPictures",
        resource_type: "image",
      });
      groupImageUrl = result.secure_url;
    }

    // ✅ create group (save picture URL in DB)
    const [result] = await create_groups.execute(
      "INSERT INTO create_groups (group_name, admin_id, group_picture,role) VALUES (?, ?, ? , ? )",
      [group_name, admin_id, groupImageUrl, role]
    );

    res.json({
      success: true,
      message: "Group created successfully",
      groupId: result.insertId,
      url: groupImageUrl || "",
      role: role || "admin",
    });
  } catch (error) {
    console.error("❌ Error creating group:", error);
    res.status(500).json({ error: "Failed to create group" });
  }
};
//add members to group
export const AddMembersToGroup = async (req, res) => {
  try {
    const admin_id = req.user.id;
    const { groupId, user_ids } = req.body;
    // console.log("idsss",user_ids, groupId, admin_id);

    if (!groupId || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({
        error: "Group ID and at least one user ID are required",
      });
    }

    // ✅ Verify admin of the group
    const [groupRows] = await create_groups.execute(
      "SELECT * FROM create_groups WHERE id = ? AND admin_id = ?",
      [groupId, admin_id]
    );

    if (groupRows.length === 0) {
      return res.status(403).json({
        error: "Only group admin can add members to the group",
      });
    }

    // ✅ Check current member count
    const [currentMembers] = await group_members.execute(
      "SELECT COUNT(*) AS count FROM group_members WHERE group_id = ?",
      [groupId]
    );
    const currentCount = currentMembers[0].count;

    const remainingSlots = 120 - currentCount;
    if (remainingSlots <= 0) {
      return res
        .status(400)
        .json({ error: "Group is already full (120 members)" });
    }

    // ✅ Avoid duplicates
    const [existingMembers] = await group_members.execute(
      "SELECT user_id FROM group_members WHERE group_id = ?",
      [groupId]
    );
    const existingIds = new Set(existingMembers.map((m) => m.user_id));
    const filteredNewMembers = user_ids.filter((id) => !existingIds.has(id));

    if (filteredNewMembers.length === 0) {
      return res.status(400).json({ error: "No new members to add" });
    }

    // ✅ Limit to available slots
    const limitedNewMembers = filteredNewMembers.slice(0, remainingSlots);

    // ✅ Bulk insert
    const memberValues = limitedNewMembers.map((uid) => [groupId, uid]);
    await group_members.query(
      "INSERT INTO group_members (group_id, user_id) VALUES ?",
      [memberValues]
    );
 
    // console.log("Limited New Members:", memberValues);
    

    // ✅ Get new members info
    const [newMembersInfo] = await users.execute(
      "SELECT id, username, phone_number,profile_picture,last_seen_at FROM users WHERE id IN (?)",
      [limitedNewMembers]
    );
    const names = newMembersInfo.map((m) => m.username).join(", ");

    // ✅ Emit socket notification to group
    // io.to(`group_${groupId}`).emit("group_join", {
    //   message: `New members added: ${names}`,
    //   groupId,
    //   addedBy: admin_id,
    //   newMembers: newMembersInfo,
    // });
    for (const member of limitedNewMembers) {
      const socketId = getReceiverSocketId(member); // use your helper
      if (socketId) {
        const socketInstance = io.sockets.sockets.get(socketId);
        if (socketInstance) {
          socketInstance.join(`group_${groupId}`);
          console.log(`🔗 User ${member} auto-joined room group_${groupId}`);
        }
      }
    }

    res.json({
      success: true,
      message: `Members added successfully`,
      addedCount: limitedNewMembers.length,
    });
  } catch (error) {
    console.error("❌ Error adding members to group:", error);
    res.status(500).json({ error: "Failed to add members to group" });
  }
};

//geting list of groups members
export const GetGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const user_id = req.user.id;


    if (!groupId) {
      return res.status(400).json({ error: "Group ID is required" });
    }

    // ✅ Check if group exists
    const [groupRows] = await create_groups.execute(
      "SELECT * FROM create_groups WHERE id = ? AND admin_id = ?",
      [groupId, user_id]
    );

    if (groupRows.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }
    // console.log("Group ID:", groupId, "User ID:", user_id);

 // ✅ Check if user is either group member OR group admin
const [memberRows] = await group_members.execute(
  "SELECT * FROM group_members WHERE user_id = ? AND group_id = ?",
  [user_id, groupId]
);

const [adminRows] = await create_groups.execute(
  "SELECT * FROM create_groups WHERE id = ? AND admin_id = ?",
  [groupId, user_id]
);

if (memberRows.length === 0 && adminRows.length === 0) {
  return res.status(403).json({ message: "You are not a member of this group" });
}

console.log("Membership verified for user:", user_id, "in group:", groupId);

    // ✅ Get all members of the group (CLEAN QUERY)
const [members] = await group_members.execute(
  `
  -- Admin
  SELECT 
      u.id AS user_id,
      u.username,
      u.phone_number,
      u.profile_picture,
      u.status,
      cg.role AS group_role,
      'Admin' AS member_role,
      cg.group_name,
      cg.admin_id,
      cg.created_at AS joined_at
  FROM create_groups cg
  JOIN users u ON cg.admin_id = u.id
  WHERE cg.id = ?

  UNION

  -- Members
  SELECT 
      u.id AS user_id,
      u.username,
      u.phone_number,
      u.profile_picture,
      u.status,
      cg.role AS group_role,
      gm.role AS member_role,
      cg.group_name,
      cg.admin_id,
      gm.joined_at
  FROM group_members gm
  JOIN users u ON gm.user_id = u.id
  JOIN create_groups cg ON gm.group_id = cg.id
  WHERE gm.group_id = ? AND gm.user_id != cg.admin_id

  ORDER BY member_role DESC, status ASC
  `,
  [groupId, groupId]
);




    // console.log("Group members retrieved:", members);
    res.json({
      success: true,
      totalMembers: members.length,
      data: members,
    });
  } catch (error) {
    console.error("❌ Error getting group members:", error);
    res.status(500).json({ error: "Failed to get group members" });
  }
};

export const LeaveGroups = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { groupId } = req.body;

    if (!groupId) {
      return res.status(400).json({ error: "Group ID is required" });
    }

    // ✅ Check membership
    const [memberRows] = await group_members.execute(
      "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
      [groupId, user_id]
    );

    if (memberRows.length === 0) {
      return res
        .status(403)
        .json({ error: "User is not a member of this group" });
    }

    // ✅ Check if user is admin of the group
    const [groupRows] = await create_groups.execute(
      "SELECT admin_id, name FROM create_groups WHERE id = ?",
      [groupId]
    );
    if (groupRows.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    const admin_id = groupRows[0].admin_id;
    const groupName = groupRows[0].name;

    if (admin_id === user_id) {
      // ✅ Admin is leaving
      const [remainingMembers] = await group_members.execute(
        "SELECT user_id FROM group_members WHERE group_id = ? AND user_id != ? LIMIT 1",
        [groupId, user_id]
      );

      if (remainingMembers.length === 0) {
        // ✅ Last member → delete group completely
        await group_members.execute(
          "DELETE FROM group_members WHERE group_id = ?",
          [groupId]
        );
        await chat_messages.execute(
          "DELETE FROM chat_messages WHERE group_id = ?",
          [groupId]
        );
        await create_groups.execute("DELETE FROM create_groups WHERE id = ?", [
          groupId,
        ]);

        io.to(groupId).emit("group_deleted", {
          message: "Group deleted as all members left",
          groupId,
        });

        return res.json({
          success: true,
          message: "Group deleted as you were the last member",
        });
      } else {
        // ✅ Transfer admin rights
        const newAdminId = remainingMembers[0].user_id;
        await create_groups.execute(
          "UPDATE create_groups SET admin_id = ? WHERE id = ?",
          [newAdminId, groupId]
        );
      }
    }

    // ✅ Remove user from group members
    await group_members.execute(
      "DELETE FROM group_members WHERE group_id = ? AND user_id = ?",
      [groupId, user_id]
    );

    // ✅ Get user name
    const [userInfo] = await users.execute(
      "SELECT name, phone_number FROM users WHERE id = ?",
      [user_id]
    );
    const userName = userInfo.length > 0 ? userInfo[0].name : "A member";

    // ✅ Notify all group members via socket
    const [remainingGroupMembers] = await group_members.execute(
      "SELECT u.phone_number FROM group_members gm JOIN users u ON gm.user_id = u.id WHERE gm.group_id = ?",
      [groupId]
    );

    for (const member of remainingGroupMembers) {
      const receiverSocketId = getReceiverSocketId(member.phone_number);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("group_notification", {
          message: `${userName} has left the group ${groupName}`,
          groupId,
          leftBy: user_id,
        });
      }
    }

    res.json({ success: true, message: "Left group successfully" });
  } catch (error) {
    console.error("❌ Error leaving group:", error);
    res.status(500).json({ error: "Failed to leave group" });
  }
};

//change group name
export const ChangeGroupName = async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId, newGroupName } = req.body;
    if (!groupId || !newGroupName) {
      return res
        .status(400)
        .json({ error: "Group ID and new group name are required" });
    }

    //checking user is member of the group
    const [groupRows] = await group_messages.execute(
      "SELECT * FROM group_messages WHERE id = ? AND admin_id = ?",
      [groupId, userId]
    );

    if (groupRows.length === 0) {
      return res
        .status(403)
        .json({ error: "You are not an admin of this group" });
    }
    await group_messages.execute(
      "UPDATE group_messages SET group_name = ? WHERE id = ?",
      [newGroupName, groupId]
    );

    // Notify group via socket
    io.to(groupId).emit("group_notification", {
      message: `Group name changed to: ${newGroupName}`,
      groupId,
    });

    res.json({ success: true, message: "Group name changed successfully" });
  } catch (error) {
    console.log("❌ Error changing group name:", error);
    res.status(500).json({ error: "Failed to change group name" });
  }
};

export const ChangeGroupNames = async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId, newGroupName } = req.body;

    if (!groupId || !newGroupName) {
      return res
        .status(400)
        .json({ error: "Group ID and new group name are required" });
    }

    const cleanName = newGroupName.trim();
    if (cleanName.length === 0) {
      return res
        .status(400)
        .json({ error: "Group name cannot be empty or only spaces" });
    }

    // Check for duplicate name
    const [existingGroups] = await group_messages.execute(
      "SELECT id FROM group_messages WHERE group_name = ? AND id != ?",
      [cleanName, groupId]
    );

    if (existingGroups.length > 0) {
      return res
        .status(400)
        .json({ error: "Another group already has this name" });
    }

    // Update name
    await group_messages.execute(
      "UPDATE group_messages SET group_name = ? WHERE id = ?",
      [cleanName, groupId]
    );

    // Add a system message (persisted in chat)
    await chat_messages.execute(
      "INSERT INTO chat_messages (group_id, sender_id, message, message_type) VALUES (?, ?, ?, ?)",
      [groupId, userId, `Group name changed to: ${cleanName}`, "system"]
    );

    // Notify via socket
    io.to(groupId).emit("group_notification", {
      message: `Group name changed to: ${cleanName}`,
      groupId,
    });

    res.json({
      success: true,
      message: "Group name changed successfully",
      newGroupName: cleanName,
    });
  } catch (error) {
    console.error("❌ Error changing group name:", error);
    res.status(500).json({ error: "Failed to change group name" });
  }
};

//delete group by admin
export const DeleteGroup = async (req, res) => {
  const conn = await db.getConnection(); // assuming db is a mysql2 pool/connection
  try {
    const adminId = req.user.id;
    const { groupId } = req.body;

    if (!groupId) {
      return res.status(400).json({ error: "Group ID is required" });
    }

    // Verify admin
    const [groupRows] = await group_messages.execute(
      "SELECT * FROM group_messages WHERE id = ? AND admin_id = ?",
      [groupId, adminId]
    );

    if (groupRows.length === 0) {
      return res
        .status(403)
        .json({ error: "You are not an admin of this group" });
    }

    await conn.beginTransaction();

    // Delete group members
    await conn.execute("DELETE FROM group_members WHERE group_id = ?", [
      groupId,
    ]);

    // Delete group messages
    await conn.execute("DELETE FROM chat_messages WHERE group_id = ?", [
      groupId,
    ]);

    // Delete group itself
    await conn.execute("DELETE FROM group_messages WHERE id = ?", [groupId]);

    await conn.commit();

    // Notify via socket (if using Socket.IO)
    io.to(groupId).emit("group_deleted", {
      message: "This group has been deleted by the admin",
      groupId,
    });

    res.json({ success: true, message: "Group deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting group:", error);
    try {
      await conn.rollback();
    } catch (rollbackError) {
      console.error("❌ Error during rollback:", rollbackError);
    }
    res.status(500).json({ error: "Failed to delete group" });
  } finally {
    conn.release?.(); // release connection if you borrowed one
  }
};

export const GetAllUserGroups = async (req, res) => {
  try {
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    /**
     * Query Explanation:
     * - First SELECT: groups created by the user (g.admin_id = user_id)
     *   - role is 'admin' by default for creator
     *   - counts total members and active members
     *   - fetch last message and timestamp
     * - Second SELECT: groups where user is a member (via group_members table)
     *   - role comes from group_members
     * - UNION combines both sets
     * - ORDER BY last_message_time DESC to get recent activity first
     */
    const [groups] = await create_groups.execute(
      `
      (
        SELECT 
          g.id, 
          g.group_name, 
          g.group_picture, 
          'admin' AS user_role,
          (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS total_members,
          (SELECT COUNT(*) 
              FROM group_members gm2 
              JOIN users u ON gm2.user_id = u.id 
              WHERE gm2.group_id = g.id AND u.status = 'active') AS active_members,
          (SELECT message FROM group_messages WHERE group_id = g.id ORDER BY created_at DESC LIMIT 1) AS last_message,
          (SELECT created_at FROM group_messages WHERE group_id = g.id ORDER BY created_at DESC LIMIT 1) AS last_message_time
        FROM create_groups g
        WHERE g.admin_id = ?
      )
      UNION
      (
        SELECT 
          g.id, 
          g.group_name, 
          g.group_picture, 
          g.role AS user_role,
          (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS total_members,
          (SELECT COUNT(*) 
              FROM group_members gm2 
              JOIN users u ON gm2.user_id = u.id 
              WHERE gm2.group_id = g.id AND u.status = 'active') AS active_members,
          (SELECT message FROM group_messages WHERE group_id = g.id ORDER BY created_at DESC LIMIT 1) AS last_message,
          (SELECT created_at FROM group_messages WHERE group_id = g.id ORDER BY created_at DESC LIMIT 1) AS last_message_time
        FROM create_groups g
        JOIN group_members gm ON g.id = gm.group_id
        WHERE gm.user_id = ?
      )
      ORDER BY last_message_time DESC;
      `,
      [user_id, user_id]
    );

    // If no groups found
    if (groups.length === 0) {
      return res.json({ success: true, totalGroups: 0, data: [] });
    }

    // Success response
    res.json({
      success: true,
      totalGroups: groups.length,
      data: groups,
    });
  } catch (error) {
    console.error("❌ Error fetching user groups:", error);
    res.status(500).json({ error: "Failed to fetch user groups" });
  }
};

//get a list of user who as chat history and contact list match with user phone number
export const getListOfUser = async (req, res) => {
  try {
    // ✅ just assign directly
    const id = req.user?.id;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // get current user's phone number
    const [row] = await execute("SELECT phone_number FROM users WHERE id = ?", [
      id,
    ]);

    if (!row || row.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const phoneNumber = row[0].phone_number;

    // get all other users except current
    const [rows] = await execute(
      "SELECT phone_number FROM users WHERE phone_number != ?",
      [phoneNumber]
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("getListOfUser error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
