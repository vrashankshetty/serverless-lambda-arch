import { Router } from 'express';
import functionRoutes from './function.routes';
import executionRoutes from './execution.routes';

const router = Router();

router.use('/functions', functionRoutes);
router.use('/run', executionRoutes);

export default router;