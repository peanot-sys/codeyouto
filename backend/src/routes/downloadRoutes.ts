import { Router } from 'express';
import { downloadController, downloadFileController } from '../controllers/downloadController';

const router = Router();

router.post('/', downloadController);
router.get('/:fileId', downloadFileController);

export { router as downloadRoutes };
