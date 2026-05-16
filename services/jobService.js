import axios from 'axios';
import Job from '../models/Job.js';

const createJob = async (jobData) => {
  return await Job.create(jobData);
};

const getAllJobs = async (filters = {}) => {
  const query = {};
  const andConditions = [];

  if (filters.skills) {
    andConditions.push({
      $or: [
        { title: { $regex: filters.skills, $options: 'i' } },
        { description: { $regex: filters.skills, $options: 'i' } },
        { company: { $regex: filters.skills, $options: 'i' } },
        { skills: { $regex: filters.skills, $options: 'i' } }
      ]
    });
  }

  if (filters.location) {
    andConditions.push({ location: { $regex: filters.location, $options: 'i' } });
  }

  if (filters.experience) {
    const expArray = filters.experience.split(',');
    const expConditions = expArray.map(exp => ({ experience: { $regex: exp, $options: 'i' } }));
    andConditions.push({ $or: expConditions });
  }

  if (filters.jobType) {
    const types = filters.jobType.split(',');
    const typeConditions = types.map(t => ({ jobType: { $regex: `^${t}$`, $options: 'i' } }));
    andConditions.push({ $or: typeConditions });
  }

  if (filters.category) {
    const categories = filters.category.split(',');
    const catConditions = categories.map(c => ({ category: { $regex: c, $options: 'i' } }));
    andConditions.push({ $or: catConditions });
  }

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  return await Job.find(query).sort({ postedAt: -1 }).populate('createdBy', 'name email');
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
