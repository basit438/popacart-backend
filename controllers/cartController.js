import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

// Utility to calculate total price
const calculateTotalPrice = async (products) => {
  let total = 0;

  for (const item of products) {
    const product = await Product.findById(item.productId);
    if (product) {
      total += product.price * item.quantity;
    }
  }

  return total;
};

// ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { products } = req.body;

    // Debug logs
    console.log("----- Incoming Add to Cart Request -----");
    console.log("userId:", userId);
    console.log("products:", products);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. User ID missing." });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: "Products must be a non-empty array." });
    }

    // Validate each product in the array
    for (const item of products) {
      if (!item.productId || typeof item.productId !== "string" || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ success: false, message: "Invalid product or quantity in the array." });
      }

      // Check if product exists
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      }
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        products: products,
      });
    } else {
      // Update quantities for existing products and add new ones
      for (const item of products) {
        const existingProduct = cart.products.find(p => p.productId.toString() === item.productId);

        if (existingProduct) {
          existingProduct.quantity += item.quantity;
        } else {
          cart.products.push(item);
        }
      }
    }

    // Recalculate total price
    cart.totalPrice = await calculateTotalPrice(cart.products);
    await cart.save();

    console.log("Cart updated successfully:", cart);

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};


// UPDATE CART ITEM QUANTITY
export const updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId, quantity } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. User ID missing." });
    }

    if (!productId || quantity < 1) {
      return res.status(400).json({ success: false, message: "Invalid product ID or quantity." });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found." });
    }

    const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: "Product not found in cart." });
    }

    cart.products[productIndex].quantity = quantity;
    cart.totalPrice = await calculateTotalPrice(cart.products);
    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Update cart quantity error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// REMOVE ITEM FROM CART
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. User ID missing." });
    }

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required." });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found." });
    }

    cart.products = cart.products.filter(p => p.productId.toString() !== productId);
    cart.totalPrice = await calculateTotalPrice(cart.products);
    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Remove cart item error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// CLEAR CART
export const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. User ID missing." });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found." });
    }

    cart.products = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({ success: true, message: "Cart cleared successfully." });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. User ID missing." });
    }

    // Find cart and populate product details
    const cart = await Cart.findOne({ userId }).lean();

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found." });
    }

    // Fetch complete product details for each item in cart
    const populatedProducts = await Promise.all(
      cart.products.map(async (item) => {
        const product = await Product.findById(item.productId).lean();
        return {
          ...item,
          product: product || null,
          subtotal: product ? product.price * item.quantity : 0
        };
      })
    );

    // Update cart with populated products
    cart.products = populatedProducts;

    res.status(200).json({ 
      success: true, 
      cart: {
        ...cart,
        products: populatedProducts.filter(item => item.product !== null)
      }
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};