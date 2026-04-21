import applicationService from '../services/applicationService.js';

// @desc    Apply for a job
// @route   POST /api/apply/:jobId
// @access  Private (Candidate)
const applyToJob = async (req, res, next) => {
  try {
    const { resume } = req.body;
    const application = await applicationService.applyToJob(
      req.params.jobId,
      req.user._id,
      resume
    );
    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

// @desc    Get my applications
// @route   GET /api/applications/my
// @access  Private (Candidate)
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await applicationService.getMyApplications(req.user._id);
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications for a job
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter)
const getJobApplications = async (req, res, next) => {
  try {
    const applications = await applicationService.getApplicationsForJob(
      req.params.jobId,
      req.user._id.toString()
    );
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

export { 
  applyToJob,
  getMyApplications,
  getJobApplications,
 };
