import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../util/CloudinaryImage.js";  // Adjust path if needed

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.mimetype.split("/")[1].toLowerCase();
    return {
      folder: "Profile",
      format: ext,
      public_id: file.originalname.split(".")[0],
    };
  },
});

// ✅ File Type Validation (Best Practice)
const fileFilter = (req, file, cb) => {
  const allowedFormats = ["png", "jpg", "jpeg", "pdf"];
  const ext = file.mimetype.split("/")[1].toLowerCase();

  if (allowedFormats.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file format: ${ext}. Only PNG, JPG, JPEG, and PDF are allowed.`), false);
  }
};

// Multer Upload Config (Single Image)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

export default upload;

// export const uploadSingleImage = upload.single("images",); // 'images' should match your frontend field name
