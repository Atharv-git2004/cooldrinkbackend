import express from "express";
import { getCart, addToCart, removeFromCart } from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🟢 1. കാർട്ട് ഡാറ്റ എടുക്കാൻ (Get Cart)
router.get("/", protect, getCart);

// 🟢 2. കാർട്ടിലേക്ക് പുതിയ പ്രൊഡക്റ്റ് ആഡ് ചെയ്യാൻ (Add to Cart)
router.post("/", protect, addToCart);

// 🟢 3. കാർട്ടിൽ നിന്ന് പ്രൊഡക്റ്റ് ഒഴിവാക്കാൻ (Remove from Cart)
// ഫ്രണ്ട്-എൻഡിലെ Cart.jsx പേജിൽ നിന്ന് ഐറ്റംസ് ഡിലീറ്റ് ചെയ്യാൻ ഈ റൂട്ട് നിർബന്ധമാണ്
router.delete("/:id", protect, removeFromCart);

export default router;
