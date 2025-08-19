import { Router } from 'express';
import authRoutes from './auth.js';
import employeeRoutes from './employees.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);

export default router;
