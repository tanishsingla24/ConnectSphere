import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getCallHistory } from '../controllers/callController.js';

const router = express.Router();

router.get('/history', authenticate, getCallHistory);

export default router;

