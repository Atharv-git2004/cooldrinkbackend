import mongoose from "mongoose";

// models/Cart.js ലെ items അറേയുടെ ഉള്ളിൽ img ഫീൽഡ് ഉണ്ടോ എന്ന് നോക്കുക
const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      productId: { type: String, required: true },
      quantity: { type: Number, default: 1 },
      price: { type: Number, required: true },
      title: { type: String },
      img: { type: String }, // 🔥 ഈ വരി നിർബന്ധമായും ഉണ്ടായിരിക്കണം!
      bgColor: { type: String }
    }
  ]
});

export default mongoose.model("Cart", cartSchema);
