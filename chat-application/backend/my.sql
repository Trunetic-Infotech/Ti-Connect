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