import Product from "../models/productModel.js";

// 1. Add a new product
export const createProduct = async (req, res) => {
  try {
    const { tagline, title, subtitle, description, price, originalPrice, bgColor, accentColor } = req.body;

    // Handle image string (URL) or uploaded file
    let img = req.body.img;
    if (req.file) {
      img = req.file.filename;
    }

    const newProduct = new Product({
      tagline,
      title,
      subtitle,
      description,
      price,
      originalPrice,
      img,
      bgColor,
      accentColor,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Error adding product", error: error.message });
  }
};

// 2. Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

// 3. Get single product by ID (Added for ProductDetail.jsx)
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product", error: error.message });
  }
};

// 4. Update an existing product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { tagline, title, subtitle, description, price, originalPrice, bgColor, accentColor } = req.body;

    let img = req.body.img;
    if (req.file) {
      img = req.file.filename;
    }

    const updateData = {
      tagline,
      title,
      subtitle,
      description,
      price,
      originalPrice,
      bgColor,
      accentColor,
    };

    if (img) {
      updateData.img = img;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};

// 5. Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};
