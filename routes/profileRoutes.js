import express from 'express';
const router = express.Router();
import {
  getMyProfile,
  createOrUpdateProfile,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  uploadResume,
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadResume as resumeUpload } from '../middleware/uploadMiddleware.js';

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

export default router;
