import express from 'express';

import { createOrder } from '../controllers/orderController.js';
import { verifyToken } from '../middlewares/verifytoken.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

const orderRouter = express.Router();

orderRouter.post('/create-order' , verifyToken, createOrder)

export default orderRouter;