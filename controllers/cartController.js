import Cart from "../models/Cart.js";

export const getCart = async (req, res) => {
  try {
    // Extract userId from the authenticated request
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId });
    res.status(200).json(cart ? cart.items : []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { item } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [item] });
    } else {
      const itemIndex = cart.items.findIndex((i) => i.productId === item.productId);

      if (itemIndex > -1) {
        // If item exists, update quantity
        cart.items[itemIndex].quantity += item.quantity || 1;
      } else {
        // If new item, add to array
        cart.items.push(item);
      }
    }
    await cart.save();
    res.status(200).json(cart.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
