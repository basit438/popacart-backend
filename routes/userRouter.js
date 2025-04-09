import express from 'express';
import { registerUser } from '../controllers/userControllers.js';
import upload from '../middlewares/multer.js';

const userRouter = express.Router();


userRouter.post('/register' ,upload.single('profileImage') , registerUser);


export default userRouter;