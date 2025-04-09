import User from '../models/user.model.js';
import { sendVerificationEmail, generateVerificationToken } from '../utils/emailVerfication.js';
import { uploadToCloudinary } from '../config/cloudinary.js'; // update path if needed

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
