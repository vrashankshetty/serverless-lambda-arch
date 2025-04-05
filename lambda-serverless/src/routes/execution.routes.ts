
// src/api/routes/execution.routes.ts
import { Router } from 'express';
import executionController from '../controllers/execution.controller';

const router = Router();

router.post('/run/:route', executionController.executeFunction);
router.get('/', executionController.getAllExecution);
router.get('/:id', executionController.getEachExecution);
router.post('/admin/cleanup', executionController.cleanupContainers);

export default router;