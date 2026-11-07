import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';

const applyToJob = async (jobId, candidateId, resume) => {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new Error('Job not found');
  }

  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error('Job not found');
  }

  // Check if already applied
  const alreadyApplied = await Application.findOne({ jobId, candidateId });
  if (alreadyApplied) {
    throw new Error('You have already applied for this job');
  }

  // Resume fallback if not explicitly provided in request body
  let finalResume = resume;
  if (!finalResume) {
    const candidate = await User.findById(candidateId);
    if (candidate && candidate.resume) {
      finalResume = candidate.resume;
    } else {
      const profile = await Profile.findOne({ user: candidateId });
      if (profile && profile.resumeUrl) {
        finalResume = profile.resumeUrl;
      }
    }
  }

  if (!finalResume) {
    throw new Error('Please provide a resume URL or upload one to your profile before applying');
  }

  return await Application.create({
    jobId,
    candidateId,
    resume: finalResume,
  });
};

const getMyApplications = async (candidateId) => {
  return await Application.find({ candidateId })
    .populate('jobId', 'title company location salary jobType')
    .sort('-createdAt');
};

const getRecruiterApplications = async (recruiterId) => {
  const myJobs = await Job.find({ createdBy: recruiterId }).select('_id');
  const jobIds = myJobs.map((j) => j._id);
  return await Application.find({ jobId: { $in: jobIds } })
    .populate('jobId', 'title company location salary jobType')
    .populate('candidateId', 'name email profilePicture resume summary skills')
    .sort('-createdAt');
};

const getApplicationsForJob = async (jobId, recruiterId) => {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new Error('Job not found');
  }

  const job = await Job.findById(jobId);
  
  if (!job) {
    throw new Error('Job not found');
  }

  // Check if the recruiter owns this job
  if (job.createdBy.toString() !== recruiterId) {
    throw new Error('Not authorized to view applications for this job');
  }

  return await Application.find({ jobId })
    .populate('candidateId', 'name email profilePicture resume summary skills')
    .sort('-createdAt');
};

const updateApplicationStatus = async (applicationId, recruiterId, status) => {
  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    throw new Error('Application not found');
  }

  const application = await Application.findById(applicationId).populate('jobId');
  if (!application) {
    throw new Error('Application not found');
  }

  if (!application.jobId || application.jobId.createdBy.toString() !== recruiterId) {
    throw new Error('Not authorized to update status for this application');
  }

  const validStatuses = ['applied', 'shortlisted', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Allowed values: ${validStatuses.join(', ')}`);
  }

  application.status = status;
  await application.save();
  return application;
};

export { 
  applyToJob,
  getMyApplications,
  getRecruiterApplications,
  getApplicationsForJob,
  updateApplicationStatus,
};
