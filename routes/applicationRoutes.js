import express from 'express';
const router = express.Router();
import {
  applyToJob,
  getMyApplications,
  getJobApplications,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// Apply for a job
router.post('/apply/:jobId', protect, authorize('candidate'), applyToJob);

// Candidate history
router.get('/applications/my', protect, authorize('candidate'), getMyApplications);

// Recruiter view
router.get('/applications/job/:jobId', protect, authorize('recruiter'), getJobApplications);

export default router;
