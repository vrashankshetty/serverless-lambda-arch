
// src/api/routes/execution.routes.ts
import { Router } from 'express';
import executionController from '../controllers/execution.controller';

const router = Router();

router.post('/:route', executionController.executeFunction);
router.post('/test', executionController.testFunction);
router.post('/admin/cleanup', executionController.cleanupContainers);

export default router;