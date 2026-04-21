import axios from 'axios';
import Job from '../models/Job.js';

const createJob = async (jobData) => {
  return await Job.create(jobData);
};

const getAllJobs = async () => {
  return await Job.find().populate('createdBy', 'name email');
};

const getJobById = async (id) => {
  return await Job.findById(id).populate('createdBy', 'name email');
};

const deleteJob = async (id, userId) => {
  const job = await Job.findById(id);

  if (!job) {
    throw new Error('Job not found');
  }

  // Check if the user is the owner of the job
  if (job.createdBy.toString() !== userId) {
    throw new Error('User not authorized to delete this job');
  }

  await job.deleteOne();
  return job;
};

const getExternalJobs = async () => {
  try {
    const response = await axios.get('https://remotive.com/api/remote-jobs?limit=10');
    const externalJobs = response.data.jobs.map((job) => ({
      _id: job.id,
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || 'Remote',
      salary: job.salary || 'Not specified',
      description: job.description,
      isExternal: true,
    }));

    const localJobs = await Job.find().populate('createdBy', 'name email');
    
    return [...localJobs, ...externalJobs];
  } catch (error) {
    console.error('External API Error:', error.message);
    // Fallback to local jobs if external API fails
    return await Job.find().populate('createdBy', 'name email');
  }
};

export { 
  createJob,
  getAllJobs,
  getJobById,
  deleteJob,
  getExternalJobs,
 };
