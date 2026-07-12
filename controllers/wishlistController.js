import Wishlist from "../models/Wishlist.js";

export const addToWishlist = async (req, res) => {
  try {
    // req.user._id അല്ലെങ്കിൽ req.user.id എടുക്കുന്നു
    const userId = req.user._id || req.user.id;
    const { item } = req.body;

    // ഫ്രണ്ട്‌എൻഡിൽ നിന്നുള്ള id-യെ productId ആക്കി മാറ്റുന്നു
    const productToAdd = {
      productId: item.productId || item.id,
      title: item.title,
      price: item.price,
      img: item.img,
    };

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      // വിഷ്‌ലിസ്റ്റ് ഇല്ലെങ്കിൽ പുതിയത് ഉണ്ടാക്കുന്നു
      wishlist = new Wishlist({ userId, items: [productToAdd] });
    } else {
      // ഐറ്റം നേരത്തെ തന്നെ ഉണ്ടോ എന്ന് ചെക്ക് ചെയ്യുന്നു
      const exists = wishlist.items.find((i) => i.productId === productToAdd.productId);

      if (exists) {
        return res.status(200).json({ message: "Item already in wishlist", alreadyExists: true });
      }
      wishlist.items.push(productToAdd);
    }

    await wishlist.save();
    res.status(200).json({ message: "Item added successfully", wishlist, alreadyExists: false });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const wishlist = await Wishlist.findOne({ userId });
    res.status(200).json(wishlist || { items: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    // parseInt ഒഴിവാക്കി, കാരണം id ഇപ്പോൾ String ആണ്
    wishlist.items = wishlist.items.filter((item) => item.productId !== productId);
    await wishlist.save();

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
