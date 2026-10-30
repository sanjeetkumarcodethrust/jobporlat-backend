import express from 'express';
const router = express.Router();
import {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  getExternalJobs,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// Static routes first (to prevent /:id from matching them)
router.get('/external', getExternalJobs);

// Dynamic routes
router
  .route('/')
  .get(getJobs)
  .post(protect, authorize('recruiter'), createJob);

router
  .route('/:id')
  .get(getJob)
  .put(protect, authorize('recruiter'), updateJob)
  .delete(protect, authorize('recruiter'), deleteJob);

export default router;
