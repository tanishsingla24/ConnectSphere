import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import bcryptjs from 'bcryptjs';

/**
 * Register a new user
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, fullName, interests } = req.body;

    // Validate input
    if (!email || !password || !fullName || !interests || interests.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required and at least one interest is needed',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    // Create new user
    const newUser = new User({
      email,
      passwordHash,
      fullName,
      interests,
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id);

    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.passwordHash;

    res.status(201).json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user by email (include password for comparison)
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been banned',
      });
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, interests } = req.body;

    // Validate input
    if (!fullName && (!interests || interests.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be updated',
      });
    }

    // Update user
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (interests && interests.length > 0) updateData.interests = interests;

    const user = await User.findByIdAndUpdate(req.userId, updateData, { new: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
