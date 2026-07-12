import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser"; // 🔥 കുക്കികൾ റീഡ് ചെയ്യാൻ ഇത് ആവശ്യമാണ്

import connectDB from "./config/db.js";
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
// Proxy Configuration (Render-ൽ കുക്കികൾ വർക്ക് ചെയ്യാൻ)
// ==========================================
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // 🔥 Render/Vercel പ്രൊഡക്ഷനിൽ സെഷൻ കുക്കികൾ സുരക്ഷിതമായി അയക്കാൻ ഇത് നിർബന്ധമാണ്
}

// ==========================================
// Middleware (CORS & Body Parser)
// ==========================================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // .env ഫയലിലെ വിൻഡോ ലിങ്ക് അല്ലെങ്കിൽ ലോക്കൽഹോസ്റ്റ്
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // 🔥 കുക്കികൾ കൈകാര്യം ചെയ്യാൻ മുകളിലായി ഇത് റൺ ചെയ്യണം

// ==========================================
// Session കോൺഫിഗറേഷൻ
// ==========================================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "my_super_secret_arctic_boost_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // പ്രൊഡക്ഷനിൽ HTTPS വഴി മാത്രം കുക്കി അയക്കുന്നു
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 ദിവസം വാലിഡിറ്റി
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // പ്രൊഡക്ഷനിൽ ക്രോസ്-ഡൊമൈൻ സപ്പോർട്ട് ചെയ്യാൻ
    },
  }),
);

// ==========================================
// Passport Initialize (Google Auth)
// ==========================================
app.use(passport.initialize());
app.use(passport.session());

// ==========================================
// Static Folder
// ==========================================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// API Routes
// ==========================================
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/products", productRoutes);
app.use("/api/home", homeRoutes);

// Admin Stats
app.get("/api/admin/stats", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();

    res.json({
      totalProducts,
      totalUsers,
      totalSales: 452000,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Test Route
app.get("/", (req, res) => {
  res.send("Arctic Sip API is Running Successfully...");
});

// ==========================================
// Global Error Handler
// ==========================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
