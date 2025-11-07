import { Router } from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  assignServiceToEmployee,
  removeServiceFromEmployee,
} from '../controllers/employees.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);
router.post('/:id/services', assignServiceToEmployee);
router.delete('/:id/services/:serviceId', removeServiceFromEmployee);

export default router;

