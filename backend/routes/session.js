import express from 'express';
import { initializeSession, validateSession, getSessionInfo } from '../controllers/sessionController.js';

const router = express.Router();

// Initialize a new session
router.post('/init', initializeSession);

// Validate existing session
router.get('/validate', validateSession);

// Get session information
router.get('/info', getSessionInfo);

export default router;
