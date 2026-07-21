import "dotenv/config";
import express from "express";
import cors from "cors";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";

// 🟢 ഗൂഗിൾ ലോഗിൻ സ്ട്രാറ്റജി ഇവിടെ ലോഡ് ചെയ്യുന്നു (പാത്ത് കൃത്യമാണെന്ന് ഉറപ്പാക്കുക!)
import "./config/passport.js";

// Routes
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";

// Models
import Product from "./models/productModel.js";
import User from "./models/User.js";

connectDB();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// 1. Proxy Configuration
// ==========================================
// Render Load Balancer-ന് പിന്നിലായതിനാൽ ഇത് നിർബന്ധമാണ്.
app.set("trust proxy", 1);

// ==========================================
// 2. Middleware (CORS & Body Parser)
// ==========================================
const allowedOrigins = ["http://localhost:5173", "https://cooldrinks-web-frontend.vercel.app"];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 3. Passport Initialize (Google Auth)
// ==========================================
// 🟢 JWT ഉപയോഗിക്കുന്നതിനാൽ ഇവിടെ express-session ആവശ്യമില്ല!
app.use(passport.initialize());

// ==========================================
// 4. Static Folder (Images ലോഡ് ചെയ്യാൻ)
// ==========================================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// 5. API Routes
// ==========================================
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/products", productRoutes);
app.use("/api/home", homeRoutes);

// ==========================================
// Admin Stats
// ==========================================
app.get("/api/admin/stats", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();

    res.status(200).json({
      totalProducts,
      totalUsers,
      totalSales: 452000, // Static for now
    });
  } catch (err) {
    console.error("Admin Stats Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
});

// ==========================================
// Base Route
// ==========================================
app.get("/", (req, res) => {
  res.send("Arctic Sip API is Running Successfully...");
});

// ==========================================
// Global Error Handler
// ==========================================
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
