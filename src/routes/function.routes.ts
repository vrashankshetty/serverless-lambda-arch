// src/api/routes/function.routes.ts
import { Router } from 'express';
import functionController from '../controllers/function.controller';

const router = Router();

router.post('/', functionController.createFunction.bind(functionController));
router.get('/', functionController.getAllFunctions.bind(functionController));
router.get('/:id', functionController.getFunctionById.bind(functionController));
router.put('/:id', functionController.updateFunction.bind(functionController));
router.delete('/:id', functionController.deleteFunction.bind(functionController));
router.get('/:id/executions', functionController.getFunctionExecutions.bind(functionController));


export default router;