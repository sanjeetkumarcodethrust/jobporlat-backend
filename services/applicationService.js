import Application from '../models/Application.js';
import Job from '../models/Job.js';

const applyToJob = async (jobId, candidateId, resume) => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error('Job not found');
  }

  // Check if already applied
  const alreadyApplied = await Application.findOne({ jobId, candidateId });
  if (alreadyApplied) {
    throw new Error('You have already applied for this job');
  }

  return await Application.create({
    jobId,
    candidateId,
    resume,
  });
};

const getMyApplications = async (candidateId) => {
  return await Application.find({ candidateId })
    .populate('jobId', 'title company location')
    .sort('-createdAt');
};

const getApplicationsForJob = async (jobId, recruiterId) => {
  const job = await Job.findById(jobId);
  
  if (!job) {
    throw new Error('Job not found');
  }

  // Check if the recruiter owns this job
  if (job.createdBy.toString() !== recruiterId) {
    throw new Error('Not authorized to view applications for this job');
  }

  return await Application.find({ jobId })
    .populate('candidateId', 'name email')
    .sort('-createdAt');
};

export { 
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
 };
