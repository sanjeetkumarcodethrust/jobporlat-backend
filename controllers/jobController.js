import * as jobService from '../services/jobService.js';

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Recruiter)
const createJob = async (req, res, next) => {
  try {
    const { title, company, location, salary, description } = req.body;

    const job = await jobService.createJob({
      title,
      company,
      location,
      salary,
      description,
      createdBy: req.user._id,
    });

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const filters = req.query;
    const jobs = await jobService.getAllJobs(filters);
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJob = async (req, res, next) => {
  try {
    const job = await jobService.getJobById(req.params.id);
    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }
    res.json(job);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter)
const deleteJob = async (req, res, next) => {
  try {
    await jobService.deleteJob(req.params.id, req.user._id.toString());
    res.json({ message: 'Job removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get external and local jobs combined
// @route   GET /api/jobs/external
// @access  Public
const getExternalJobs = async (req, res, next) => {
  try {
    const jobs = await jobService.getExternalJobs();
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

export { 
  createJob,
  getJobs,
  getJob,
  deleteJob,
  getExternalJobs,
 };
