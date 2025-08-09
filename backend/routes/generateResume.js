import express from 'express';
import sessionMiddleware from '../middlewares/sessionMiddleware.js';
import { generateResume } from '../controllers/generateResumeController.js';

const router = express.Router();

// Apply session middleware
router.use(sessionMiddleware);

router.post('/', generateResume);

export default router;
