import Cart from "../models/Cart.js";
import Product from "../models/productModel.js";

// 🟢 1. GET USER CART
export const getCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID not found" });
    }

    // .populate("items.productId") വഴി പ്രൊഡക്റ്റിലെ ഒറിജിനൽ ഡാറ്റ മൊത്തമായി ഫ്രണ്ട്എൻഡിലേക്ക് കിട്ടും
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

    const productId = req.body.productId || req.body.item?.productId;
    const quantity = Number(req.body.quantity) || Number(req.body.item?.quantity) || 1;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // 💡 ഇവിടെയാണ് മാജിക്! ഡാറ്റാബേസിൽ നിന്ന് ഒറിജിനൽ പ്രൊഡക്റ്റ് ഡാറ്റ കണ്ടുപിടിക്കുന്നു
    const productInfo = await Product.findById(productId);
    if (!productInfo) {
      return res.status(404).json({ message: "Product not found in database" });
    }

    // ഫ്രണ്ട്എൻഡ് തന്നില്ലെങ്കിലും ഡാറ്റാബേസിൽ ഉള്ള വിവരങ്ങൾ (img, price, title) ഇങ്ങോട്ട് എടുക്കും
    const title = req.body.title || req.body.item?.title || productInfo.title;
    const price = req.body.price || req.body.item?.price || productInfo.price;
    const img = req.body.img || req.body.item?.img || req.body.bottleImage || req.body.item?.bottleImage || productInfo.img;
    const bgColor = req.body.bgColor || req.body.item?.bgColor || productInfo.bgColor;

    const cartItem = { productId, quantity, price, title, img, bgColor };
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // പുതിയ കാർട്ട് ഉണ്ടാക്കുന്നു
      cart = new Cart({ userId, items: [cartItem] });
    } else {
      // പ്രൊഡക്റ്റ് നിലവിൽ കാർട്ടിൽ ഉണ്ടോ എന്ന് നോക്കുന്നു
      const itemIndex = cart.items.findIndex((i) => i.productId && i.productId.toString() === productId.toString());

      if (itemIndex > -1) {
        // ക്വാണ്ടിറ്റി കൂട്ടുന്നു
        cart.items[itemIndex].quantity += quantity;

        // ഫീൽഡുകൾ അപ്ഡേറ്റ് ചെയ്യുന്നു
        cart.items[itemIndex].price = price;
        cart.items[itemIndex].title = title;
        if (img) cart.items[itemIndex].img = img;
        if (bgColor) cart.items[itemIndex].bgColor = bgColor;
      } else {
        // പുതിയ ഐറ്റം കാർട്ടിലേക്ക് പുഷ് ചെയ്യുന്നു
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

    // ഐറ്റം ഡിലീറ്റ് ചെയ്യാനുള്ള ഫിൽട്ടർ
    cart.items = cart.items.filter((item) => item._id?.toString() !== id && item.productId?.toString() !== id);

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: error.message });
  }
};
