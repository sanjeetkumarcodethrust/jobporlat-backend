import express from 'express';
const router = express.Router();
import {
  createJob,
  getJobs,
  getJob,
  deleteJob,
  getExternalJobs,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router
  .route('/')
  .get(getJobs)
  .post(protect, authorize('recruiter'), createJob);

router.get('/external', getExternalJobs);

router
  .route('/:id')
  .get(getJob)
  .delete(protect, authorize('recruiter'), deleteJob);

export default router;
