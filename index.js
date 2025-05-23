import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './DB/dbconnection.js';
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRouter.js';
import productRouter from './routes/productRouter.js';
import cartRouter from './routes/cartRouter.js';
import couponRouter from './routes/couponRouter.js';
import wishlistRouter from './routes/wishlistRouter.js';
import orderRouter from './routes/orderRouter.js';
const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: "https://isband-client.vercel.app",
  // origin : "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// connectDB

 await connectDB();

//  routes

app.use('/api/v1/user', userRouter);
app.use('/api/v1/product', productRouter);
app.use('/api/v1/cart', cartRouter); 
app.use('/api/v1/coupon', couponRouter);
app.use('/api/v1/wishlist', wishlistRouter);
app.use('/api/v1/order', orderRouter); 


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
