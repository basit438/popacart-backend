import express from 'express';

import { addToWishlist , getWishlist } from '../controllers/wishlistController.js';
import { verifyToken } from '../middlewares/verifytoken.js';


const WishlistRouter = express.Router();
// WishlistRouter.get('/', getWishlist);

WishlistRouter.post('/add',verifyToken, addToWishlist); // Add product to wishlist
WishlistRouter.get('/', verifyToken, getWishlist);
// WishlistRouter.delete('/remove', verifyToken, removeFromWishlist); 

export default WishlistRouter;