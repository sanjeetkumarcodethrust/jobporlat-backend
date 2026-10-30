import express from 'express';
const router = express.Router();
import {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// Apply for a job
router.post('/apply/:jobId', protect, authorize('candidate'), applyToJob);

// Candidate history
router.get('/applications/my', protect, authorize('candidate'), getMyApplications);

// Recruiter views
router.get('/applications/job/:jobId', protect, authorize('recruiter'), getJobApplications);
router.patch('/applications/:id/status', protect, authorize('recruiter'), updateApplicationStatus);

export default router;
