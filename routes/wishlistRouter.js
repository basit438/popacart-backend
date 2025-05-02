import express from 'express';

import { addToWishlist , getWishlist } from '../controllers/wishlistController.js';
import { verifyToken } from '../middlewares/verifytoken.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';


const WishlistRouter = express.Router();
// WishlistRouter.get('/', getWishlist);

WishlistRouter.post('/add',verifyToken, roleMiddleware('user'), addToWishlist); // Add product to wishlist
WishlistRouter.get('/', verifyToken, roleMiddleware('user'), getWishlist);
// WishlistRouter.delete('/remove', verifyToken, removeFromWishlist); 

export default WishlistRouter;