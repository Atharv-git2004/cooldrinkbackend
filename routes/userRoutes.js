import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
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
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// 3. ഗൂഗിൾ ലോഗിൻ Callback (JWT Token നിർമ്മിച്ച് ഫ്രണ്ട്‌എൻഡിലേക്ക് അയക്കുന്നു)
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    session: false,
  }),
  (req, res) => {
    try {
      // 🟢 JWT Token ജനറേറ്റ് ചെയ്യുന്നു
      const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: "30d" });

      const userObj = {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        image: req.user.image,
      };

      // 🟢 Token-ഉം User വിവരങ്ങളും URL വഴി Vercel-ലേക്ക് റീഡയറക്ട് ചെയ്യുന്നു
      const redirectUrl = `${process.env.FRONTEND_URL}/?token=${token}&user=${encodeURIComponent(JSON.stringify(userObj))}`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Google Auth Callback Error:", error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
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
