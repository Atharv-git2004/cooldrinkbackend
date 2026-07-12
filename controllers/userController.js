import User from "../models/User.js";
import jwt from "jsonwebtoken";

// ടോക്കൺ ജനറേറ്റ് ചെയ്യാനുള്ള ഫംഗ്ഷൻ
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "your_jwt_secret_key", {
    expiresIn: "30d", // 30 ദിവസത്തേക്ക് ടോക്കൺ വാലിഡ് ആയിരിക്കും
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 */
export const registerUser = async (req, res) => {
  const { username, email, password, image } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: "ഈ ഇമെയിലിൽ ഒരു അക്കൗണ്ട് ഓൾറെഡി നിലവിലുണ്ട്!" });
    }

    const user = await User.create({
      username,
      email,
      password, // Production-ൽ bcrypt ഉപയോഗിച്ച് ഹാഷ് ചെയ്യുക
      image: image || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      role: "user",
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: "അക്കൗണ്ട് വിജയകരമായി ക്രിയേറ്റ് ചെയ്തു!",
        token: generateToken(user._id), // രജിസ്റ്റർ ചെയ്യുമ്പോൾ ടോക്കൺ കൊടുക്കുന്നു
        user: { _id: user._id, username: user.username, email: user.email, image: user.image, role: user.role },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "രജിസ്ട്രേഷൻ പരാജയപ്പെട്ടു!", error: error.message });
  }
};

/**
 * @desc    Auth user & get token (Login)
 * @route   POST /api/users/login
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "യൂസറെ കണ്ടെത്താനായില്ല!" });
    }

    if (user.password === password) {
      res.status(200).json({
        success: true,
        message: "Login Successful",
        token: generateToken(user._id), // 🟢 ഇവിടെയാണ് പ്രധാന മാറ്റം: ലോഗിൻ ചെയ്യുമ്പോൾ ടോക്കൺ കൊടുക്കുന്നു
        user: { _id: user._id, username: user.username, email: user.email, image: user.image, role: user.role },
      });
    } else {
      res.status(401).json({ success: false, message: "പാസ്‌വേഡ് തെറ്റാണ്!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "ലോഗിൻ പരാജയപ്പെട്ടു!", error: error.message });
  }
};
