import express from 'express';
import { createCoupon } from '../controllers/couponController.js';
import { verifyToken } from '../middlewares/verifytoken.js';

const couponRouter = express.Router();

couponRouter.post('/create', verifyToken, createCoupon);

export default couponRouter;