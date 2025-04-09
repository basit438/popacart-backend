import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './DB/dbconnection.js';
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRouter.js';
const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(express.json());
// app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
// connectDB

 await connectDB();

//  routes

app.use('/api/v1/user', userRouter);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
