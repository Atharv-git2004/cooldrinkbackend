import multer from "multer"; // 🟢 ഇവിടെ ഉണ്ടായിരുന്ന കമന്റ് (//) ഒഴിവാക്കി!
import path from "path";
import fs from "fs"; // 🟢 ഫോൾഡർ തനിയെ ഉണ്ടാക്കാൻ ഇത് ചേർത്തു

// 'uploads' ഫോൾഡർ ഇല്ലെങ്കിൽ അത് തനിയെ ക്രിയേറ്റ് ചെയ്യാൻ
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. ചിത്രങ്ങൾ എവിടെ, ഏത് പേരിൽ സേവ് ചെയ്യണം എന്ന് തീരുമാനിക്കുന്നു
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // ഒരേ പേരുള്ള ചിത്രങ്ങൾ വന്നാൽ പ്രശ്നമാകാതിരിക്കാൻ പേരിനൊപ്പം സമയവും ചേർക്കുന്നു
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // ഫയലിന്റെ ഫോർമാറ്റ് (.jpg, .png) എടുക്കുന്നു
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// 2. ഇമേജ് ഫയലുകൾ മാത്രമേ അപ്‌ലോഡ് ചെയ്യാവൂ എന്ന് ഉറപ്പുവരുത്തുന്നു
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// 3. Multer സെറ്റപ്പ് ചെയ്യുന്നു (Max size: 5MB)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
});

export default upload;
