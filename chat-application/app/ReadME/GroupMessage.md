```markdown
# 📱 Group Chat System - Debug README

Real-time group messaging with **media support** (images/videos/contacts) + **membership validation**

```
Frontend: React Native + Socket.IO
Backend: Express + MySQL + Cloudinary
```

## 📂 File Structure

```
├── app/screens/pages/
│   └── GroupMessage.jsx              # 🎯 MAIN FILE - Group chat UI + logic
│
├── app/(tabs)/components/
│   ├── MessagesList/
│   │   └── MessagesList.jsx          # 📋 Renders message bubbles
│   ├── SenderMessage/
│   │   └── SendMessageBar.jsx        # ⌨️ Input + media picker
│   └── GroupChatHeader/
│       └── GroupChatHeader.jsx       # 👥 Group info + actions
│
└── backend/
    ├── routes/message/
    │   └── groupMessageRoutes.js      # 🔗 API endpoints
    └── controller/message/
        └── groupeMessageController.js # 🧠 MAIN BACKEND LOGIC
```

## 🔗 Critical API Endpoints

| Method | Endpoint                              | Purpose         | Payload                          |
|--------|---------------------------------------|-----------------|----------------------------------|
| `POST` | `/groups/send/messages/upload`        | **UPLOAD** media| `FormData { media_url }`         |
| `POST` | `/groups/send/messages`               | **SEND** message| `{ groupId, media_url/fileUrls }`|
| `GET`  | `/get/group/messages?groupId=123`     | **LOAD** messages| `query: { groupId }`            |

## 🐛 Debug Flow - Message Sending

```
1. User picks image → SendMessageBar.jsx
   ↓
2. handleSend() → GroupMessage.jsx (L200-300)
   ↓ UPLOAD
3. POST /groups/send/messages/upload
   ↓
4. SendGroupMessageUploadController.js (L50)
   ↓ RETURNS { fileUrl, fileUrls }
   ↓ SEND
5. POST /groups/send/messages
   ↓
6. SendGroupMessage() (L10-150) 
   ↓ SAVES to DB + SOCKET EMIT
   ↓
7. Frontend socket.on("groupNewMessage") → Adds to state
```

## ⚡ Quick Debug Checklist

| Issue                    | Check This                              | Line           |
|--------------------------|-----------------------------------------|----------------|
| **Infinite loading**     | `GetGroupMessages` emit removed?        | L180 **REMOVE**|
| **Media not sending**    | `fileUrl` OR `fileUrls[0]` exists?      | Frontend L250  |
| **"Not member" error**   | Membership validation passes?           | Backend L25-45 |
| **Socket not working**   | `groupNewMessage` handler correct?      | Frontend L80   |
| **Text not encrypted**   | `CryptoJS.AES.encrypt()` called?        | Backend L110   |

## 🔍 Logging Points

### Frontend (add these):
```javascript
console.log("🧪 MEDIA:", media);           // GroupMessage.jsx L200
console.log("🧪 UPLOAD RES:", up.data);    // GroupMessage.jsx L260
console.log("🧪 SOCKET DATA:", data);      // GroupMessage.jsx L80
```

### Backend (add these):
```javascript
console.log("📤 SENDING:", req.body);      // SendGroupMessage L15
console.log("📤 UPLOADED:", fileUrls);     // UploadController L25
console.log("📡 EMITTING:", newMsg);       // SendGroupMessage L80
```

## 🎯 Test Cases

| Test             | Action                    | Expected                |
|------------------|---------------------------|-------------------------|
| **Text**         | Type "hello" → Send       | 1 text bubble           |
| **Single Image** | Camera → Send             | 1 image bubble          |
| **3 Images**     | Gallery → Send            | **3 SEPARATE** bubbles  |
| **Video**        | Video → Send              | 1 video bubble          |
| **Contact**      | Contact → Send            | 1 contact bubble        |

## 💡 Common Fixes

| Error                           | Fix                                            |
|---------------------------------|------------------------------------------------|
| `Cannot convert undefined...`   | Add `if (!media?.name)` check                  |
| `Infinite loop`                 | Remove emit from `GetGroupMessages`            |
| `fileUrls is undefined`         | Use `up.data.fileUrl || up.data.fileUrls[0]`   |
| `Not a member`                  | Check `Block_Group` & `Leave_Group` in DB      |

## 🛠 Database Tables

```sql
group_messages: id, group_id, sender_id, message, message_type, media_url
group_members:  group_id, user_id, Block_Group, Leave_Group
create_groups:  id, admin_id, group_name
```

## 🚨 Infinite Loop Root Cause

```
GetGroupMessages emits ALL messages → 
Socket handler adds them → 
State updates → 
Component re-renders → 
Socket reconnects → 
GetGroupMessages called again → 
🔄 INFINITE LOOP!
```

**FIX:** Remove `io.emit()` from `GetGroupMessages`

## 📈 Message Types Supported

| Type     | Frontend Payload      | Backend `message_type` | UI Bubble |
|----------|----------------------|------------------------|-----------|
| Text     | `{ message: "hi" }`   | `text`                 | 💬        |
| Image    | `{ media_url: "..." }`| `image`                | 🖼️        |
| Video    | `{ media_url: "..." }`| `video`                | ▶️        |
| Contact  | `{ contact_details }` | `contact`              | 👤        |

---

**🚀 Last Updated:** Nov 27, 2025  
**👨‍💻 Built for:** Fast debugging + onboarding  
**⏱️ Debug Time:** < 2 minutes with this README
```

---

**Save as `README_GROUP_CHAT.md`** in your project root! 

**Now anyone can debug in < 2 minutes!** 🎉