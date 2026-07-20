import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

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
// 1. Proxy Configuration (CRITICAL FOR RENDER)
// ==========================================
// Render Load Balancer-ന് പിന്നിലായതിനാൽ ഇത് നിർബന്ധമാണ്.
// ഇത് എപ്പോഴും പ്രവർത്തിക്കുന്ന രീതിയിൽ മാറ്റിയിട്ടുണ്ട്.
app.set("trust proxy", 1);

// ==========================================
// 2. Middleware (CORS & Body Parser)
// ==========================================
const allowedOrigins = ["http://localhost:5173", "https://cooldrinks-web-frontend.vercel.app"];

// Environment വേരിയബിളിൽ നിന്ന് ട്രെയിലിംഗ് സ്ലാഷ് (/) ഉണ്ടെങ്കിൽ ഒഴിവാക്കുന്നു
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
    credentials: true, // കുക്കികൾ അലൗ ചെയ്യാൻ നിർബന്ധം
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ==========================================
// 3. Session Configuration (Fixed for Vercel -> Render)
// ==========================================
const isProduction = process.env.NODE_ENV === "production";

app.use(
  session({
    secret: process.env.SESSION_SECRET || "my_super_secret_arctic_boost_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // പ്രൊഡക്ഷനിൽ True ആയിരിക്കണം (HTTPS)
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 Days
      sameSite: isProduction ? "none" : "lax", // Cross-site കുക്കികൾക്ക് പ്രൊഡക്ഷനിൽ 'none' നിർബന്ധമാണ്
    },
  }),
);

// ==========================================
// 4. Passport Initialize (Google Auth)
// ==========================================
app.use(passport.initialize());
app.use(passport.session());

// ==========================================
// 5. Static Folder (Images ലോഡ് ചെയ്യാൻ)
// ==========================================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// 6. API Routes
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
      totalSales: 452000,
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
