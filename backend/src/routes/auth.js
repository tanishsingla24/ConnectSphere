import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { loginLimiter, signupLimiter } from '../middleware/rateLimiter.js';
import { register, login, getCurrentUser, updateProfile } from '../controllers/authController.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', signupLimiter, register);

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', loginLimiter, login);

/**
 * GET /api/auth/me
 * Get current user profile (protected route)
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * PUT /api/auth/me
 * Update user profile (protected route)
 */
router.put('/me', authenticate, updateProfile);

export default router;
