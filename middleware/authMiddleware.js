import jwt from "jsonwebtoken";
import User from "../models/User.js"; // 🟢 ഡാറ്റാബേസിൽ നിന്ന് യൂസറെ എടുക്കാൻ ഇത് വേണം

export const protect = async (req, res, next) => {
  try {
    // 1. Google വഴി ലോഗിൻ ചെയ്ത യൂസർ ആണെങ്കിൽ (Passport.js), ഇതിനകം req.user ഉണ്ടാവും. അവരെ കടത്തിവിടാം.
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }

    let token;

    // 2. കുക്കിയിൽ ടോക്കൺ ഉണ്ടോ എന്ന് നോക്കുന്നു
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 3. Headers-ൽ ടോക്കൺ ഉണ്ടോ എന്ന് നോക്കുന്നു
    else if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.toLowerCase().startsWith("bearer ")) {
        token = authHeader.split(" ")[1];
      } else {
        token = authHeader;
      }
    }

    // ടോക്കൺ ഇല്ലെങ്കിൽ തടയുന്നു
    if (!token || token === "undefined" || token === "null") {
      return res.status(401).json({ success: false, message: "Not authorized, no valid token provided" });
    }

    // ടോക്കൺ വെരിഫൈ ചെയ്യുന്നു
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");

    // 🟢 വെരിഫൈ ചെയ്ത ID വെച്ച് Database-ൽ നിന്ന് യൂസറെ എടുക്കുന്നു (പാസ്‌വേഡ് ഒഴിവാക്കി)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ success: false, message: "Not authorized, token failed or expired" });
  }
};
