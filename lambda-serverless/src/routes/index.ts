import { Router } from 'express';
import functionRoutes from './function.routes';
import executionRoutes from './execution.routes';
import profileRoutes from './profile.routes';
const router = Router();

router.use('/functions', functionRoutes);
router.use('/executions', executionRoutes);
router.use('/profile', profileRoutes);
export default router;