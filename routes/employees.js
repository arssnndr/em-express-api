import { Router } from 'express';
import { getAllEmployees, getEmployeeById, createEmployee, deleteEmployee } from '../controllers/employeeController.js';

const router = Router();

router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);
router.post('/', createEmployee);
router.delete('/:id', deleteEmployee);

export default router;
