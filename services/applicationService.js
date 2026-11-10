import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';

const applyToJob = async (jobId, candidateId, applicationData = {}) => {
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

  // Normalize input data
  const data = typeof applicationData === 'string' ? { resume: applicationData } : applicationData;

  const candidate = await User.findById(candidateId);
  const profile = await Profile.findOne({ user: candidateId });

  // Resolve Resume
  let finalResume = data.resume?.trim();
  if (!finalResume) {
    if (candidate && candidate.resume) {
      finalResume = candidate.resume;
    } else if (profile && profile.resumeUrl) {
      finalResume = profile.resumeUrl;
    }
  }

  if (!finalResume) {
    throw new Error('Please provide your resume URL or upload one to your profile before applying');
  }

  // Resolve Full Name
  const finalFullName = data.fullName?.trim() || candidate?.name || 'Applicant';

  // Resolve Email
  const finalEmail = data.email?.trim() || candidate?.email || '';

  // Resolve Mobile/Phone
  const finalPhone = data.phone?.trim() || candidate?.phone || profile?.phone || '';

  // Resolve Address
  const finalAddress = data.address?.trim() || candidate?.address || profile?.location || '';

  const finalCoverNote = data.coverNote?.trim() || '';
  const finalExperience = data.experience?.trim() || '';

  // Sync phone, address, resume to User document if not already set
  if (candidate) {
    let shouldSaveUser = false;
    if (finalPhone && !candidate.phone) {
      candidate.phone = finalPhone;
      shouldSaveUser = true;
    }
    if (finalAddress && !candidate.address) {
      candidate.address = finalAddress;
      shouldSaveUser = true;
    }
    if (finalResume && !candidate.resume) {
      candidate.resume = finalResume;
      shouldSaveUser = true;
    }
    if (shouldSaveUser) {
      try {
        await candidate.save();
      } catch (err) {
        console.error('Non-critical: could not sync user phone/address:', err.message);
      }
    }
  }

  return await Application.create({
    jobId,
    candidateId,
    resume: finalResume,
    fullName: finalFullName,
    email: finalEmail,
    phone: finalPhone,
    address: finalAddress,
    coverNote: finalCoverNote,
    experience: finalExperience,
  });
};

const getMyApplications = async (candidateId) => {
  return await Application.find({ candidateId })
    .populate('jobId', 'title company location salary jobType category description')
    .sort('-createdAt');
};

const getRecruiterApplications = async (recruiterId) => {
  const myJobs = await Job.find({ createdBy: recruiterId }).select('_id');
  const jobIds = myJobs.map((j) => j._id);
  return await Application.find({ jobId: { $in: jobIds } })
    .populate('jobId', 'title company location salary jobType')
    .populate('candidateId', 'name email profilePicture resume summary skills phone address')
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
    .populate('candidateId', 'name email profilePicture resume summary skills phone address')
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
