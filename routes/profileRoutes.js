const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  createOrUpdateProfile,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  uploadResume,
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { uploadResume: resumeUpload } = require('../middleware/uploadMiddleware');

// All routes are protected
router.use(protect);

// Profile CRUD
router.get('/me', getMyProfile);
router.post('/', createOrUpdateProfile);

// Experience
router.put('/experience', addExperience);
router.delete('/experience/:expId', deleteExperience);

// Education
router.put('/education', addEducation);
router.delete('/education/:eduId', deleteEducation);

// Resume upload
router.post('/resume', resumeUpload.single('resume'), uploadResume);

module.exports = router;
