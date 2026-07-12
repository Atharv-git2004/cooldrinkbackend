import Cart from "../models/Cart.js";

// 🟢 1. GET USER CART
export const getCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID not found" });
    }

    // 💡 ഇവിടെയാണ് നമ്മൾ മാറ്റം വരുത്തിയത്!
    // .populate("items.productId") കൊടുക്കുമ്പോൾ പ്രൊഡക്റ്റിലെ ഒറിജിനൽ ഇമേജ് കാർട്ടിലേക്ക് വരും.
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    res.status(200).json(cart ? cart.items : []);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🟢 2. ADD ITEM TO CART
export const addToCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID not found" });
    }

    // Dynamic field extraction supporting both structured item objects or flat objects
    const productId = req.body.productId || req.body.item?.productId;
    const quantity = Number(req.body.quantity) || Number(req.body.item?.quantity) || 1;
    const price = req.body.price || req.body.item?.price;
    const title = req.body.title || req.body.item?.title;

    // Fallback checks for image property names
    const img = req.body.img || req.body.item?.img || req.body.bottleImage || req.body.item?.bottleImage;
    const bgColor = req.body.bgColor || req.body.item?.bgColor;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const cartItem = { productId, quantity, price, title, img, bgColor };
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create a brand new cart if it doesn't exist
      cart = new Cart({ userId, items: [cartItem] });
    } else {
      // Check if product already exists inside the items array
      const itemIndex = cart.items.findIndex((i) => i.productId && i.productId.toString() === productId.toString());

      if (itemIndex > -1) {
        // Update item quantity
        cart.items[itemIndex].quantity += quantity;

        // Force overwrite missing fields if they changed or were missing
        if (img) cart.items[itemIndex].img = img;
        if (bgColor) cart.items[itemIndex].bgColor = bgColor;
      } else {
        // Push brand new item to the array
        cart.items.push(cartItem);
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Backend AddToCart Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// 🟢 3. REMOVE ITEM FROM CART
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Filter out items using database unique _id or specific productId string matches
    cart.items = cart.items.filter((item) => item._id?.toString() !== id && item.productId?.toString() !== id);

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: error.message });
  }
};
