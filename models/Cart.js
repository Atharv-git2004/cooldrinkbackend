import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          // 💡 ഇവിടെയാണ് മാറ്റം വരുത്തിയത്: ObjectId ഒഴിവാക്കി String ആക്കി
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
        img: {
          type: String,
          required: false,
        },
        bgColor: {
          type: String,
          required: false,
        },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Cart", cartSchema);
