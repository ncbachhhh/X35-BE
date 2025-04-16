import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import path from 'path';

cloudinary.v2.config({
  cloud_name: "dwkqq3lew",
  api_key: "129722234838328",
  api_secret: "COWuBo5DVJn5jcs9kJSv-GEC5Sg",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: (req, file) => {
      const nameWithoutExt = path.parse(file.originalname).name;
      return `${Date.now()}-${nameWithoutExt}`;
    },
  },
});

const upload = multer({ storage });

export default upload;
