import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. കുക്കിയിൽ ടോക്കൺ ഉണ്ടോ എന്ന് നോക്കുന്നു
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Headers-ൽ ടോക്കൺ ഉണ്ടോ എന്ന് നോക്കുന്നു (Case-insensitive check)
    else if (req.headers.authorization) {
      const authHeader = req.headers.authorization;

      // 'bearer ' എന്ന് ചെറിയ അക്ഷരത്തിലാണെങ്കിലും ടോക്കൺ കൃത്യമായി സ്പ്ലിറ്റ് ചെയ്ത് എടുക്കുന്നു
      if (authHeader.toLowerCase().startsWith("bearer ")) {
        token = authHeader.split(" ")[1];
      } else {
        token = authHeader; // 'Bearer' കീവേഡ് ഇല്ലെങ്കിൽ നേരിട്ട് ടോക്കൺ ആയി എടുക്കുന്നു
      }
    }

    // 💡 ടോക്കൺ ഇല്ലെങ്കിലോ അല്ലെങ്കിൽ ഫ്രണ്ട്-എൻഡിൽ നിന്ന് 'undefined', 'null' എന്ന് സ്ട്രിങ് ആയി വന്നാലോ തടയുന്നു
    if (!token || token === "undefined" || token === "null") {
      return res.status(401).json({ success: false, message: "Not authorized, no valid token provided" });
    }

    // ടോക്കൺ വെരിഫൈ ചെയ്യുന്നു
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");

    // വെരിഫൈ ചെയ്ത യൂസറിന്റെ വിവരങ്ങൾ req.user ലേക്ക് കൊടുക്കുന്നു
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ success: false, message: "Not authorized, token failed or expired" });
  }
};
