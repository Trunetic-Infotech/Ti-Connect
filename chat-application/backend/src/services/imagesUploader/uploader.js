import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../utils/images/Cloudinary.js";

// Map MIME types → Cloudinary resource_type
const getResourceType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/") || mimetype.startsWith("audio/")) return "video"; 
  return "raw"; // pdf, text, docs, zips, etc.
};


// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split(".").pop().toLowerCase();

    // Auto-detect folder (optional: separate by type)
    let folder = "Uploads";
    if (file.mimetype.startsWith("image/")) folder = "Images";
    else if (file.mimetype.startsWith("video/")) folder = "Videos";
    else if (file.mimetype.startsWith("audio/")) folder = "Audios";
    else folder = "Documents";

    return {
      folder,
      resource_type: getResourceType(file.mimetype),
      format: ext,
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

// ✅ File Type Validation (Optional)
const fileFilter = (req, file, cb) => {
  // Allow all common types (or restrict if needed)
 const allowedMimes = [
  // Images
  "image/png", "image/jpg", "image/jpeg", "image/webp", "image/gif",
  // Videos
  "video/mp4", "video/mov", "video/mpeg", "video/avi",
  // Audio
  "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm",
  // Documents
  "application/pdf", "application/msword","application/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv", "text/plain", "application/zip"
];

  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

// Multer Upload Config (Single or Multiple)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB limit (adjust as needed)
});

export default upload;
