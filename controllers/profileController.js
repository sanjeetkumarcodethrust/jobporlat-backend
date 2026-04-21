const profileService = require('../services/profileService');

// @desc    Get current user's profile
// @route   GET /api/profile/me
// @access  Private
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user._id);

    if (!profile) {
      res.status(404);
      throw new Error('Profile not found. Please create your profile.');
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update profile
// @route   POST /api/profile
// @access  Private
const createOrUpdateProfile = async (req, res, next) => {
  try {
    const profile = await profileService.createOrUpdateProfile(
      req.user._id,
      req.body
    );
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Add experience to profile
// @route   PUT /api/profile/experience
// @access  Private
const addExperience = async (req, res, next) => {
  try {
    const { title, company, location, from, to, current, description } = req.body;

    if (!title || !company || !from) {
      res.status(400);
      throw new Error('Title, company, and start date are required');
    }

    const profile = await profileService.addExperience(req.user._id, {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    });

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete experience from profile
// @route   DELETE /api/profile/experience/:expId
// @access  Private
const deleteExperience = async (req, res, next) => {
  try {
    const profile = await profileService.deleteExperience(
      req.user._id,
      req.params.expId
    );
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Add education to profile
// @route   PUT /api/profile/education
// @access  Private
const addEducation = async (req, res, next) => {
  try {
    const { institution, degree, fieldOfStudy, from, to, description } = req.body;

    if (!institution || !degree || !from) {
      res.status(400);
      throw new Error('Institution, degree, and start date are required');
    }

    const profile = await profileService.addEducation(req.user._id, {
      institution,
      degree,
      fieldOfStudy,
      from,
      to,
      description,
    });

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete education from profile
// @route   DELETE /api/profile/education/:eduId
// @access  Private
const deleteEducation = async (req, res, next) => {
  try {
    const profile = await profileService.deleteEducation(
      req.user._id,
      req.params.eduId
    );
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload resume
// @route   POST /api/profile/resume
// @access  Private
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a file (PDF, DOC, or DOCX)');
    }

    const filePath = `/uploads/resumes/${req.file.filename}`;
    const profile = await profileService.uploadResume(req.user._id, filePath);

    res.json({
      message: 'Resume uploaded successfully',
      resumeUrl: filePath,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  createOrUpdateProfile,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  uploadResume,
};
