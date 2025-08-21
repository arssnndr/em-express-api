import { Router } from 'express';
import { getAllEmployees, getEmployeeById, createEmployee, deleteEmployee } from '../controllers/employeeController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Protect all routes below with JWT auth
router.use(requireAuth);

router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);
router.post('/', createEmployee);
router.delete('/:id', deleteEmployee);

export default router;
