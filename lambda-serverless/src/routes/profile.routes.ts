
import { Router } from 'express';
import dashboardController from '../controllers/dashboard.controller';

const router = Router();

router.get('/dashboard', dashboardController.getDashboard.bind(dashboardController));

export default router;