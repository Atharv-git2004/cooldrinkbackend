import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    tagline: {
      type: String,
      required: false, // "PURE REFRESHMENT" പോലെയുള്ള ചെറിയ ടെക്സ്റ്റ്
    },
    title: {
      type: String,
      required: true, // "SPRITE"
    },
    subtitle: {
      type: String,
      required: false, // "Premium Flavor"
    },
    description: {
      type: String,
      required: false, // പ്രോഡക്റ്റിന്റെ വിവരണം
    },
    price: {
      type: Number,
      required: true, // ഇപ്പോഴത്തെ വില (99)
    },
    originalPrice: {
      type: Number,
      required: false, // പഴയ വില / MRP (120) - ഇത് വെട്ടിക്കാണിക്കാൻ വേണ്ടി
    },
    img: {
      type: String,
      required: false, // ഇമേജ് URL
    },
    bgColor: {
      type: String,
      required: false,
      default: "#008B47", // ബാക്ക്ഗ്രൗണ്ട് കളർ
    },
    accentColor: {
      type: String,
      required: false,
      default: "#FFFFFF", // ബട്ടൺ / ടെക്സ്റ്റ് കളർ
    },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);
export default Product;
