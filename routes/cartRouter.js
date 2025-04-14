import express from "express";
import { addToCart, getCart, updateCartItemQuantity, removeCartItem, clearCart } from "../controllers/cartController.js";
import { verifyToken } from "../middlewares/verifytoken.js";

const cartRouter = express.Router();

cartRouter.post("/add", verifyToken, addToCart); // Add item to Cart
cartRouter.get("/", verifyToken, getCart); // Get cart
cartRouter.put("/update-quantity", verifyToken, updateCartItemQuantity); // Update item quantity
cartRouter.delete("/remove-item", verifyToken, removeCartItem); // Remove item from cart
cartRouter.delete("/clear", verifyToken, clearCart); // Clear entire cart

export default cartRouter;