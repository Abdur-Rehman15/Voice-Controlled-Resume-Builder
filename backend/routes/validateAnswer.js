import express from 'express';
import { validateAnswer } from '../controllers/validateAnswerController.js';
const router = express.Router();

router.post('/', validateAnswer);

export default router;
