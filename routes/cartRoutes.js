import express from "express";
import { getCart, addToCart } from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// കാർട്ട് ഡാറ്റ എടുക്കാൻ
router.get("/", protect, getCart);

// 🟢 കാർട്ടിലേക്ക് പുതിയ പ്രൊഡക്റ്റ് ആഡ് ചെയ്യാൻ ( "/add" എന്നത് മാറ്റി "/" ആക്കി )
router.post("/", protect, addToCart);

export default router;
