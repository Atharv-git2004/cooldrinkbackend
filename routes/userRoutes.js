import express from "express";
import jwt from "jsonwebtoken";

// 🟢 CRITICAL FIX: പാസ്‌പോർട്ട് സ്ട്രാറ്റജി രജിസ്റ്റർ ചെയ്ത ഫയലിൽ നിന്ന് തന്നെ ഇമ്പോർട്ട് ചെയ്യുന്നു
import passport from "../config/passport.js";

import { registerUser, loginUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 1. സാധാരണ ലോഗിൻ & രജിസ്ട്രേഷൻ
router.post("/register", registerUser);
router.post("/login", loginUser);

// ==========================================
// ഗൂഗിൾ ലോഗിൻ റൂട്ടുകൾ
// ==========================================

// 2. ഗൂഗിൾ ലോഗിൻ ആരംഭിക്കാൻ
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

// 3. ഗൂഗിൾ ലോഗിൻ Callback (JWT Token നിർമ്മിച്ച് ഫ്രണ്ട്‌എൻഡിലേക്ക് അയക്കുന്നു)
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL || "https://cooldrinks-web-frontend.vercel.app"}/login?error=google_auth_failed`,
    session: false,
  }),
  (req, res) => {
    try {
      if (!req.user) {
        const frontendUrl = process.env.FRONTEND_URL || "https://cooldrinks-web-frontend.vercel.app";
        return res.redirect(`${frontendUrl.replace(/\/$/, "")}/login?error=no_user`);
      }

      // 🟢 JWT Token ജനറേറ്റ് ചെയ്യുന്നു
      const secret = process.env.JWT_SECRET || "fallback_secret_key";
      const token = jwt.sign({ id: req.user._id, role: req.user.role }, secret, { expiresIn: "30d" });

      const userObj = {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        image: req.user.image,
      };

      const frontendUrl = process.env.FRONTEND_URL || "https://cooldrinks-web-frontend.vercel.app";

      // 🟢 Token-ഉം User വിവരങ്ങളും URL വഴി Vercel-ലേക്ക് റീഡയറക്ട് ചെയ്യുന്നു
      const redirectUrl = `${frontendUrl.replace(/\/$/, "")}/?token=${token}&user=${encodeURIComponent(
        JSON.stringify(userObj),
      )}`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Google Auth Callback Error:", error);
      const frontendUrl = process.env.FRONTEND_URL || "https://cooldrinks-web-frontend.vercel.app";
      res.redirect(`${frontendUrl.replace(/\/$/, "")}/login?error=auth_failed`);
    }
  },
);

// 4. യൂസർ വിവരങ്ങൾ എടുക്കാൻ
router.get("/me", protect, (req, res) => {
  if (req.user) {
    res.status(200).json({ success: true, user: req.user });
  } else {
    res.status(401).json({ success: false, message: "Not authenticated" });
  }
});

// 5. ലോഗൗട്ട് ചെയ്യാൻ
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.status(200).json({ success: true, message: "Logged out successfully" });
  });
});

export default router;
