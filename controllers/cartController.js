import Cart from "../models/Cart.js";

// 🟢 1. GET CART
export const getCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID not found" });
    }

    const cart = await Cart.findOne({ userId });
    res.status(200).json(cart ? cart.items : []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟢 2. ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID not found" });
    }

    const productId = req.body.productId || req.body.item?.productId;
    const quantity = Number(req.body.quantity) || Number(req.body.item?.quantity) || 1;
    const price = req.body.price || req.body.item?.price;
    const title = req.body.title || req.body.item?.title;

    // ഫ്രണ്ട്-എൻഡിൽ നിന്ന് bottleImage ആയോ img ആയോ വന്നാലും എടുക്കാൻ
    const img = req.body.img || req.body.item?.img || req.body.bottleImage;
    const bgColor = req.body.bgColor || req.body.item?.bgColor;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const cartItem = { productId, quantity, price, title, img, bgColor };

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // കാർട്ട് ഇല്ലെങ്കിൽ പുതിയത് ഉണ്ടാക്കുന്നു
      cart = new Cart({ userId, items: [cartItem] });
    } else {
      // കാർട്ട് ഉണ്ടെങ്കിൽ ഈ പ്രൊഡക്റ്റ് നേരത്തെ ഉണ്ടോ എന്ന് നോക്കുന്നു
      const itemIndex = cart.items.findIndex((i) => i.productId && i.productId.toString() === productId.toString());

      if (itemIndex > -1) {
        // പ്രൊഡക്റ്റ് ഉണ്ടെങ്കിൽ ക്വാണ്ടിറ്റി കൂട്ടുന്നു
        cart.items[itemIndex].quantity += quantity;

        // ഇമേജോ കളറോ മാറിയിട്ടുണ്ടെങ്കിൽ അതും അപ്ഡേറ്റ് ചെയ്യുന്നു
        if (img) cart.items[itemIndex].img = img;
        if (bgColor) cart.items[itemIndex].bgColor = bgColor;
      } else {
        // പുതിയ പ്രൊഡക്റ്റ് ആണെങ്കിൽ അറേയിലേക്ക് പുഷ് ചെയ്യുന്നു
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

// 🟢 3. REMOVE FROM CART
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

    cart.items = cart.items.filter((item) => item._id?.toString() !== id && item.productId?.toString() !== id);

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
