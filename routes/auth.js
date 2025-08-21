import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { loginUser, logoutUser, registerUser } from '../controllers/authController.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, loginUser);
router.post('/logout', logoutUser);
router.post('/register', registerUser);

export default router;
