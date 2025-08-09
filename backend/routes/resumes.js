import express from 'express';
import sessionMiddleware from '../middlewares/sessionMiddleware.js';
import { getResumes, getResume, deleteResume, getResumeStats } from '../controllers/resumeController.js';

const router = express.Router();

// Apply session middleware to all routes
router.use(sessionMiddleware);

// Get all resumes for the session
router.get('/', getResumes);

// Get resume statistics
router.get('/stats', getResumeStats);

// Get a specific resume by ID
router.get('/:resumeId', getResume);

// Delete a resume
router.delete('/:resumeId', deleteResume);

export default router;
