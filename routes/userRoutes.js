import express from "express";
import passport from "passport";
import { registerUser, loginUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js"; // 🟢 ഇത് ഇംപോർട്ട് ചെയ്തു

const router = express.Router();

// മാനുവൽ രജിസ്ട്രേഷൻ & ലോഗിൻ
router.post("/register", registerUser);
router.post("/login", loginUser);

// ==========================================
// ഗൂഗിൾ ലോഗിൻ റൂട്ടുകൾ (404 Error ഫിക്സ്)
// ==========================================

// 1. ഗൂഗിൾ ലോഗിൻ പേജിലേക്ക് പോകാൻ
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// 2. ഗൂഗിൾ വെരിഫിക്കേഷൻ കഴിഞ്ഞു തിരികെ വരുന്ന റൂട്ട്
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: process.env.FRONTEND_URL + "/login" }),
  (req, res) => {
    // ലോഗിൻ വിജയകരമായാൽ ഫ്രണ്ടെൻഡിലേക്ക് റീഡയറക്ട് ചെയ്യുന്നു
    res.redirect(process.env.FRONTEND_URL + "/");
  },
);

// 3. ലോഗിൻ ചെയ്ത യൂസറുടെ ഡാറ്റ ഫ്രണ്ടെൻഡിന് കൊടുക്കാൻ
// 🟢 ഇവിടെ 'protect' നൽകി. ഇതോടെ ടോക്കൺ വെരിഫൈ ചെയ്ത് മാത്രം ഡാറ്റ നൽകും.
router.get("/me", protect, (req, res) => {
  if (req.user) {
    res.status(200).json({ success: true, user: req.user });
  } else {
    res.status(401).json({ success: false, message: "ലോഗിൻ ചെയ്തിട്ടില്ല" });
  }
});

// 4. ലോഗൗട്ട് ചെയ്യാൻ
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.status(200).json({ success: true, message: "ലോഗൗട്ട് ചെയ്തു" });
  });
});

export default router;
