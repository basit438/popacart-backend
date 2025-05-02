import User from '../models/user.model.js';
import { sendVerificationEmail, generateVerificationToken } from '../utils/emailVerfication.js';
import { uploadToCloudinary } from '../config/cloudinary.js'; // update path if 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function registerUser(req, res) {
  try {
    const {
      fullName,
      email,
      password,
      phoneNumber,
      gender,
      dateOfBirth,
      role
    } = req.body;

    console.log("Request body:", req.body);
    console.log("File received:", req.file);

    // 1. Validate required fields
    if (!fullName || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: "Full name, email, password, and phone number are required" });
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // 3. Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    // 4. Upload profile image (if provided)
    let profileImageUrl;
    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file);
      profileImageUrl = uploaded.secure_url;
    }

    // 5. Create new user (password hashing is handled in the model)
    const newUser = new User({
      fullName,
      email,
      password,
      phoneNumber,
      profileImage: profileImageUrl, // will use default from schema if undefined
      gender,
      dateOfBirth,
      role
    });

    await newUser.save();

    // 6. Generate email verification token
    const token = generateVerificationToken(email);

    // 7. Send verification email
    await sendVerificationEmail(email, token);

    // 8. Send response
    return res.status(201).json({
      message: "User registered successfully. Please verify your email and login.",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        profileImage: newUser.profileImage,
        gender: newUser.gender,
        dateOfBirth: newUser.dateOfBirth,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Error registering user" });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    

    if (!email || !password) {
     
      return res.status(400).json({ message: "All fields are required" });
    }

    const userToFind = await User.findOne({ email });
    if (!userToFind) {
     
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is verified
    if (!userToFind.isEmailVerified) {
    
      return res
        .status(401)
        .json({ message: "User is not verified. Please verify your email" });
    }

    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(
      password,
      userToFind.password
    );
    if (!isPasswordCorrect) {
      
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Authorize user: Create a JWT token using userToFind
    const payload = { 
      id: userToFind._id, 
      email: userToFind.email,
      role: userToFind.role // Include the user's role in the token payload
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
  

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,  // Always true for HTTPS
      sameSite: "none",  // Required for cross-origin cookies
      maxAge: 24 * 60 * 60 * 1000,  // 1 day
  });
  
    

  const loggedInUser = {
    id: userToFind._id,
    fullName: userToFind.fullName,
    email: userToFind.email,
    phoneNumber: userToFind.phoneNumber,
    profileImage: userToFind.profileImage,
    gender: userToFind.gender,
    dateOfBirth: userToFind.dateOfBirth,
    role: userToFind.role,
  };
  

    
    return res
      .status(200)
      .json({ message: "User logged in successfully", user: loggedInUser });
  } catch (error) {
    
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// Logout user

export function logoutUser(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  return res.status(200).json({ message: "User logged out successfully" });
}
