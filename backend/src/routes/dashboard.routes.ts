import { Router } from 'express';
import { getDashboardStats, getRecentActivities } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/activities', getRecentActivities);

export default router;

