import express from "express";
import multer from "multer";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// Multer Configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const safeFileName = file.originalname.replace(/\s+/g, "-");
    cb(null, Date.now() + "-" + safeFileName);
  },
});

const upload = multer({ storage: storage });

// POST: Add a new product
router.post("/", upload.single("image"), createProduct);

// GET: Fetch all products
router.get("/", getProducts);

// GET: Fetch a single product by ID
router.get("/:id", getProductById);

// PUT: Update a product by ID
router.put("/:id", upload.single("image"), updateProduct);

// DELETE: Delete a product by ID
router.delete("/:id", deleteProduct);

export default router;
