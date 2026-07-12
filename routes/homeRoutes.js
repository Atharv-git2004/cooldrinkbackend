import express from "express";
import multer from "multer";
import { updateHomeData, getHomeData, deleteHomeData } from "../controllers/homeController.js";

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Create or Update Data (expects "image" key in FormData)
router.post("/update", upload.single("image"), updateHomeData);

// Fetch All Data
router.get("/get", getHomeData);

// Delete Data by ID
router.delete("/delete/:id", deleteHomeData);

export default router;
