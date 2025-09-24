CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) default NULL,
    phone_number VARCHAR(15) NOT NULL,
    email VARCHAR(255) UNIQUE default null,
    profile_picture VARCHAR(500) default null,
    status ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
    last_seen DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    otp_store VARCHAR(10) default null,
    expires_at DATETIME,
    last_seen_at DATETIME
);



CREATE TABLE user_invite_links (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    invite_code VARCHAR(50) UNIQUE NOT NULL,
    invite_url VARCHAR(255) UNIQUE NOT NULL,
    status ENUM('active','expired','revoked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


-- CHAT GROUPS
CREATE TABLE create_groups (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL UNIQUE,
    admin_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- GROUP MEMBERS (many-to-many between users and groups)
CREATE TABLE group_members (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_member (group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES create_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- CHAT MESSAGES (for both groups and optionally DMs)
CREATE TABLE group_messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT UNSIGNED NULL,         -- if message belongs to a group
    sender_id BIGINT UNSIGNED NOT NULL,    -- user who sent it
    receiver_id BIGINT UNSIGNED NULL,      -- for one-to-one chat (optional)
    message TEXT,
    message_type ENUM('text', 'image', 'video', 'file', 'system') DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES create_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES group_members(id),
    FOREIGN KEY (receiver_id) REFERENCES group_members(id)
);






















--  //filrer online users
--   //  const onlineUserIds = onlineUsers.map((u) => u.id);
--   // const filteredUsers = showOnlineOnly //   ? users.filter((user) => onlineUserIds.includes(user.id))
--   //    : users;  // if (isUserLoading) return <Text>Loading...</Text>;
--   //  Filter chats by search //
--   // const filteredChats = chatsList.filter((chat) => { //     const name = chat.name || "";
--   //  const text = chat.text || "";
--   //    return ( //       name.toLowerCase().includes(search.toLowerCase()) || //       text.toLowerCase().includes(search.toLowerCase()) //     ); //   });