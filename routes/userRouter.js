import express from 'express';
import { loginUser, logoutUser, registerUser } from '../controllers/userControllers.js';
import upload from '../middlewares/multer.js';

const userRouter = express.Router();


userRouter.post('/register' ,upload.single('profileImage') , registerUser);

userRouter.post('/login', loginUser);

userRouter.post('/logout', logoutUser);



export default userRouter;