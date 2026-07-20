import express from "express";
import passport from "passport";
import { registerUser, loginUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// സാധാരണ ലോഗിൻ & രജിസ്ട്രേഷൻ
router.post("/register", registerUser);
router.post("/login", loginUser);

// ==========================================
// ഗൂഗിൾ ലോഗിൻ റൂട്ടുകൾ
// ==========================================

// 1. ഗൂഗിൾ ലോഗിൻ ആരംഭിക്കാൻ
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// 2. ഗൂഗിൾ ലോഗിൻ പൂർത്തിയായി തിരികെ വരുന്ന റൂട്ട് (Callback)
router.get(
  "/google/callback",
  passport.authenticate("google", {
    // ലോഗിൻ പരാജയപ്പെട്ടാൽ Vercel ലെ ലോഗിൻ പേജിലേക്ക് പോകും
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  (req, res) => {
    // ലോഗിൻ വിജയകരമായാൽ Vercel ഫ്രണ്ടെൻഡ് ഹോം പേജിലേക്ക് റീഡയറക്ട് ചെയ്യും
    res.redirect(`${process.env.FRONTEND_URL}/`);
  },
);

// യൂസർ വിവരങ്ങൾ എടുക്കാൻ
router.get("/me", protect, (req, res) => {
  if (req.user) {
    res.status(200).json({ success: true, user: req.user });
  } else {
    res.status(401).json({ success: false, message: "Not authenticated" });
  }
});

// ലോഗൗട്ട് ചെയ്യാൻ
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.status(200).json({ success: true, message: "Logged out successfully" });
  });
});

export default router;
