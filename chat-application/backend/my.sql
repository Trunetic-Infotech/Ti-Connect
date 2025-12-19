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


-- INSERT INTO ti_connect.group_messages 
-- (group_id, sender_id, message, message_type, created_at) 
-- VALUES
-- (1, 1, 'Hello everyone, welcome to the group!', 'text', NOW()),
-- (1, 6, 'Hi all, good to be here!', 'text', NOW() - INTERVAL 1 MINUTE),
-- (1, 2, 'Did you check the latest updates?', 'text', NOW() - INTERVAL 2 MINUTE),
-- (1, 1, 'Yes, I saw them yesterday.', 'text', NOW() - INTERVAL 3 MINUTE),
-- (1, 2, 'Let’s schedule a meeting tomorrow.', 'text', NOW() - INTERVAL 4 MINUTE),
-- (1, 6, 'Okays.', 'text', NOW() - INTERVAL 4 MINUTE);
-- (1, 3, 'I will be available after 3 PM.', 'text', NOW() - INTERVAL 5 MINUTE),

USE ti_connect;

DELIMITER $$

CREATE TRIGGER after_group_create
AFTER INSERT ON create_groups
FOR EACH ROW
BEGIN
  -- Insert admin into group_members only if not already present
  IF NOT EXISTS (
    SELECT 1 
    FROM group_members 
    WHERE group_id = NEW.id 
      AND user_id = NEW.admin_id
  ) THEN
    INSERT INTO group_members (group_id, user_id, role)
    VALUES (NEW.id, NEW.admin_id, 'admin');
  END IF;
END$$

DELIMITER ;


ALTER TABLE ti_connect.chat_messages
ADD COLUMN duration DOUBLE DEFAULT NULL AFTER media_url;

ALTER TABLE ti_connect.chat_messages
MODIFY COLUMN message_type ENUM('text','image','video','audio','file','contact','document') NOT NULL DEFAULT 'text';

Disable FK checks SET FOREIGN_KEY_CHECKS = 0; 
TRUNCATE TABLE ti_connect.create_groups;
Re-enable FK checks SET FOREIGN_KEY_CHECKS = 1;

ALTER TABLE ti_connect.create_groups
ADD COLUMN role VARCHAR(250) DEFAULT 'Admin';




Disable FK checks SET FOREIGN_KEY_CHECKS = 0; 
TRUNCATE TABLE ti_connect.group_members;
Re-enable FK checks SET FOREIGN_KEY_CHECKS = 1;

ALTER TABLE ti_connect.group_members
ADD COLUMN Block_Group ENUM('block', 'unblock') NOT NULL DEFAULT 'unblock';

DELIMITER $$

CREATE TRIGGER after_group_create
AFTER INSERT ON ti_connect.create_groups
FOR EACH ROW
BEGIN
  -- Insert admin into group_members only if not already present
  IF NOT EXISTS (
    SELECT 1 
    FROM ti_connect.group_members 
    WHERE group_id = NEW.id 
      AND user_id = NEW.admin_id
  ) THEN
    INSERT INTO group_members (group_id, user_id, role)
    VALUES (NEW.id, NEW.admin_id, 'admin');
  END IF;
END$$

DELIMITER ;




ALTER TABLE ti_connect.group_messages
DROP FOREIGN KEY group_messages_ibfk_2;
ALTER TABLE ti_connect.group_messages
ADD CONSTRAINT fk_sender_user FOREIGN KEY (sender_id) REFERENCES users(id);
//check data
SELECT * FROM borrowed_books WHERE id = 2
SELECT * FROM borrowed_books  WHERE id = 2 AND status = 'returned'


    
ALTER TABLE group_messages 
MODIFY COLUMN message TEXT DEFAULT NULL;
//update Data
UPDATE borrowed_books 
         SET status = 'returned', return_date = ? ,total_days_borrowed = 0
         WHERE id = ?


    //Adding joint on table 
  SELECT 
        br.id,
        s.student_name,
        s.roll_number,
        b.title AS book_title,
        b.author AS book_author,
        br.return_date,
        br.condition_notes,
        br.fine_amount,
        br.paid,
        t.teacher_name AS librarian_name
      FROM returned_books br
      JOIN students s ON br.student_id = s.id
      JOIN books b ON br.book_id = b.id
      LEFT JOIN teacher t ON br.librarian_teacher_id = t.id
      WHERE br.admin_id = ?
      ORDER BY br.return_date DESC


   // Get total number of students (for pagination)
    const [[{ totalStudents }]] = await students.execute(
      `SELECT COUNT(*) AS totalStudents FROM students WHERE subclass_id = ?`,
      [subclass_id]
    );

    
//pagination  how I apply
export const subClassStudenallProfileController = async (req, res) => {
  try {
    // Get page & limit from query, set default values
    let { page = 1, limit = 12 } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    const offset = (page - 1) * limit;

    const { subclass_id } = req.params;

    console.log(req.params);
    console.log("Pagination Params:", { page, limit, offset });

    console.log("Pagination Params:", { page, limit, offset });

    console.log(req.userID);

    // Fetch user data with class_name and division
    const [rows] = await students.execute(
      `SELECT 
      students.id,
      students.roll_number,
      students.student_name,
      students.email,
      students.phone_number,
      students.address,
      students.aadhaar_number,
      students.admission_date,
      students.status,
      students.admission_id,
      students.date_of_birth,
      students.images,
      students.class_id,
      students.subclass_id,
      students.division,
      class_table.class_name,  
      c.course_name
    FROM students
      LEFT JOIN class_table ON students.class_id = class_table.id
      LEFT JOIN subclass ON students.subclass_id = subclass.id
      LEFT JOIN courses c ON class_table.course_id = c.id
    WHERE students.subclass_id = ?  
    LIMIT ${limit} OFFSET ${offset}`, // ✅ Using Template Literals for LIMIT/OFFSET

      [subclass_id]
    );
    // console.log(rows);

    // Get total number of students (for pagination)
    const [[{ totalStudents }]] = await students.execute(
      `SELECT COUNT(*) AS totalStudents FROM students WHERE subclass_id = ?`,
      [subclass_id]
    );

    // console.log(totalStudents);/

    if (rows.length === 0) {
      return res.status(404).json({ message: "Students not found" });
    }

    // Format the students data
    const Students = rows.map((user) => ({
      id: user.id,
      roll_number: user.roll_number,
      student_name: user.student_name,
      email: user.email,
      phone_number: user.phone_number,
      address: user.address,
      aadhaar_number: user.aadhaar_number,
      admission_date: user.admission_date,
      status: user.status,
      admission_id: user.admission_id,
      date_of_birth: user.date_of_birth,
      images: user.images,
      class_Name: user.class_name,
      class_id: user.class_id, // Now correctly fetched from the class table
      subclass_id: user.subclass_id, // Now correctly fetched from the class table
      division: user.division, // Now correctly fetched from the subclass table
      course_name: user.course_name,
    }));

    // Calculate total pages
    const totalPages = Math.ceil(totalStudents / limit);

    // console.log(Students)
    // console.log(totalPages)

    res.status(200).json({
      message: "All Students profile retrieved successfully!",
      Students,
      currentPage: page,
      totalPages,
      totalStudents,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};































