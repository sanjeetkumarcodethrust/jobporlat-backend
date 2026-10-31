import axios from 'axios';
import mongoose from 'mongoose';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Application from '../models/Application.js';

const escapeRegex = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim();
};

const createJob = async (jobData) => {
  return await Job.create(jobData);
};

const getAllJobs = async (filters = {}) => {
  const query = {};
  const andConditions = [];

  // Search keyword across title, description, company, skills, category
  const keyword = filters.search || filters.keyword || filters.q || filters.skills;
  if (keyword) {
    const safeKeyword = escapeRegex(keyword);
    if (safeKeyword) {
      andConditions.push({
        $or: [
          { title: { $regex: safeKeyword, $options: 'i' } },
          { description: { $regex: safeKeyword, $options: 'i' } },
          { company: { $regex: safeKeyword, $options: 'i' } },
          { skills: { $regex: safeKeyword, $options: 'i' } },
          { category: { $regex: safeKeyword, $options: 'i' } },
        ],
      });
    }
  }

  // Location filter
  if (filters.location) {
    const safeLocation = escapeRegex(filters.location);
    if (safeLocation) {
      andConditions.push({ location: { $regex: safeLocation, $options: 'i' } });
    }
  }

  // Experience filter
  if (filters.experience) {
    const expArray = filters.experience
      .split(',')
      .map((s) => escapeRegex(s))
      .filter(Boolean);
    if (expArray.length > 0) {
      const expConditions = expArray.map((exp) => ({
        experience: { $regex: exp, $options: 'i' },
      }));
      andConditions.push({ $or: expConditions });
    }
  }

  // Job Type filter
  if (filters.jobType) {
    const types = filters.jobType
      .split(',')
      .map((s) => escapeRegex(s))
      .filter(Boolean);
    if (types.length > 0) {
      const typeConditions = types.map((t) => ({
        jobType: { $regex: `^${t}$`, $options: 'i' },
      }));
      andConditions.push({ $or: typeConditions });
    }
  }

  // Category filter
  if (filters.category) {
    const categories = filters.category
      .split(',')
      .map((s) => escapeRegex(s))
      .filter(Boolean);
    if (categories.length > 0) {
      const catConditions = categories.map((c) => ({
        category: { $regex: c, $options: 'i' },
      }));
      andConditions.push({ $or: catConditions });
    }
  }

  if (filters.title && !keyword) {
    const safeTitle = escapeRegex(filters.title);
    if (safeTitle) {
      andConditions.push({ title: { $regex: safeTitle, $options: 'i' } });
    }
  }

  if (filters.company) {
    const safeCompany = escapeRegex(filters.company);
    if (safeCompany) {
      andConditions.push({ company: { $regex: safeCompany, $options: 'i' } });
    }
  }

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  return await Job.find(query).sort({ postedAt: -1 }).populate('createdBy', 'name email');
};

const getJobById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }
  return await Job.findById(id).populate('createdBy', 'name email');
};

const updateJob = async (id, userId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Job not found');
  }

  const job = await Job.findById(id);

  if (!job) {
    throw new Error('Job not found');
  }

  // Check if the user is the owner of the job
  if (job.createdBy.toString() !== userId) {
    throw new Error('User not authorized to update this job');
  }

  if (updateData.skills) {
    if (typeof updateData.skills === 'string') {
      updateData.skills = updateData.skills.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (Array.isArray(updateData.skills)) {
      updateData.skills = updateData.skills.map((s) => s.trim()).filter(Boolean);
    }
  }

  Object.assign(job, updateData);
  await job.save();
  return job;
};

const deleteJob = async (id, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Job not found');
  }

  const job = await Job.findById(id);

  if (!job) {
    throw new Error('Job not found');
  }

  // Check if the user is the owner of the job
  if (job.createdBy.toString() !== userId) {
    throw new Error('User not authorized to delete this job');
  }

  // Clean up any applications associated with this job
  await Application.deleteMany({ jobId: id });

  await job.deleteOne();
  return job;
};

const getExternalJobs = async () => {
  try {
    const response = await axios.get('https://remotive.com/api/remote-jobs?limit=10', {
      timeout: 5000,
    });
    const externalJobs = (response.data?.jobs || []).map((job) => ({
      _id: `ext-${job.id}`,
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || 'Remote',
      salary: job.salary || 'Not specified',
      description: job.description,
      isExternal: true,
    }));

    const localJobs = await Job.find().sort({ postedAt: -1 }).populate('createdBy', 'name email');
    
    return [...localJobs, ...externalJobs];
  } catch (error) {
    console.error('External API Error:', error.message);
    // Fallback cleanly to local jobs if external API fails or times out
    return await Job.find().sort({ postedAt: -1 }).populate('createdBy', 'name email');
  }
};

export { 
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getExternalJobs,
};
