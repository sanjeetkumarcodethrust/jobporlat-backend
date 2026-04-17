const express = require('express');
const router = express.Router();
const {
  applyToJob,
  getMyApplications,
  getJobApplications,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Apply for a job
router.post('/apply/:jobId', protect, authorize('candidate'), applyToJob);

// Candidate history
router.get('/applications/my', protect, authorize('candidate'), getMyApplications);

// Recruiter view
router.get('/applications/job/:jobId', protect, authorize('recruiter'), getJobApplications);

module.exports = router;
