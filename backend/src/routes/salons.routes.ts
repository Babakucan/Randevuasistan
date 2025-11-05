import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getSalons,
  getSalonById,
  createSalon,
  updateSalon,
  deleteSalon,
} from '../controllers/salons.controller';

const router = Router();

router.use(authenticate);

router.get('/', getSalons);
router.get('/:id', getSalonById);
router.post('/', createSalon);
router.put('/:id', updateSalon);
router.delete('/:id', deleteSalon);

export default router;

