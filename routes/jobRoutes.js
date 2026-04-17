const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJob,
  deleteJob,
  getExternalJobs,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(getJobs)
  .post(protect, authorize('recruiter'), createJob);

router.get('/external', getExternalJobs);

router
  .route('/:id')
  .get(getJob)
  .delete(protect, authorize('recruiter'), deleteJob);

module.exports = router;
