import axios from 'axios';
import mongoose from 'mongoose';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Application from '../models/Application.js';

const escapeRegex = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim();
};

const mapExperienceFilter = (expInput) => {
  if (!expInput) return [];
  const rawList = expInput
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const patterns = new Set();

  for (const raw of rawList) {
    if (
      raw === 'fresher' ||
      raw.includes('entry') ||
      raw.includes('0-1') ||
      raw.includes('intern')
    ) {
      patterns.add('fresher');
      patterns.add('entry level');
      patterns.add('0-1');
      patterns.add('intern');
      patterns.add('junior');
      patterns.add('trainee');
    } else if (raw === '1-3' || raw.includes('1-3') || raw === 'mid level') {
      patterns.add('1-3');
      patterns.add('mid level');
      patterns.add('entry level');
      patterns.add('junior');
      patterns.add('associate');
    } else if (raw === '3-5' || raw.includes('3-5')) {
      patterns.add('3-5');
      patterns.add('mid level');
      patterns.add('intermediate');
      patterns.add('senior level');
    } else if (
      raw === '5+' ||
      raw.includes('5+') ||
      raw.includes('senior') ||
      raw.includes('director') ||
      raw.includes('executive') ||
      raw.includes('lead')
    ) {
      patterns.add('5\\+');
      patterns.add('senior');
      patterns.add('lead');
      patterns.add('director');
      patterns.add('executive');
      patterns.add('management');
      patterns.add('principal');
      patterns.add('staff');
      patterns.add('architect');
    } else {
      patterns.add(escapeRegex(raw));
    }
  }

  return Array.from(patterns);
};

const mapLocationFilter = (locInput) => {
  if (!locInput) return [];
  const raw = locInput.trim().toLowerCase();
  const patterns = new Set();
  patterns.add(escapeRegex(locInput.trim()));

  if (raw.includes('bangalore') || raw.includes('bengaluru')) {
    patterns.add('bangalore');
    patterns.add('bengaluru');
  }
  if (raw.includes('pune')) {
    patterns.add('pune');
    patterns.add('hinjewadi');
    patterns.add('kharadi');
    patterns.add('magarpatta');
  }
  if (
    raw.includes('delhi') ||
    raw.includes('gurgaon') ||
    raw.includes('gurugram') ||
    raw.includes('noida')
  ) {
    patterns.add('delhi');
    patterns.add('gurgaon');
    patterns.add('gurugram');
    patterns.add('noida');
    patterns.add('ncr');
    patterns.add('cyber city');
  }
  if (raw.includes('mumbai') || raw.includes('bombay')) {
    patterns.add('mumbai');
    patterns.add('bombay');
    patterns.add('navi mumbai');
  }
  if (raw.includes('hyderabad')) {
    patterns.add('hyderabad');
    patterns.add('hitec city');
    patterns.add('telangana');
  }
  if (raw.includes('chennai')) {
    patterns.add('chennai');
    patterns.add('tamil nadu');
  }
  if (raw.includes('remote') || raw.includes('wfh')) {
    patterns.add('remote');
    patterns.add('flexible');
  }
  if (raw.includes('india')) {
    [
      'india',
      'pune',
      'bengaluru',
      'bangalore',
      'delhi',
      'gurugram',
      'gurgaon',
      'mumbai',
      'hyderabad',
      'chennai',
      'noida',
      'maharashtra',
      'karnataka',
      'haryana',
    ].forEach((p) => patterns.add(p));
  }
  if (raw.includes('london') || raw.includes('uk')) {
    patterns.add('london');
    patterns.add('united kingdom');
    patterns.add('uk');
  }
  if (raw === 'us' || raw === 'usa' || raw.includes('united states')) {
    patterns.add('united states');
    patterns.add('new york');
    patterns.add('san francisco');
    patterns.add('ca');
    patterns.add('ny');
  }

  return Array.from(patterns);
};

const buildKeywordCondition = (keyword) => {
  const safeKeyword = escapeRegex(keyword);
  if (!safeKeyword) return null;

  // Exact phrase match across all searchable fields
  const exactCond = {
    $or: [
      { title: { $regex: safeKeyword, $options: 'i' } },
      { description: { $regex: safeKeyword, $options: 'i' } },
      { company: { $regex: safeKeyword, $options: 'i' } },
      { skills: { $regex: safeKeyword, $options: 'i' } },
      { category: { $regex: safeKeyword, $options: 'i' } },
    ],
  };

  const words = keyword
    .split(/\s+/)
    .map((w) => w.trim().toLowerCase())
    .filter(
      (w) =>
        w.length > 1 &&
        !['in', 'at', 'for', 'with', 'and', 'or', 'the', 'a', 'an', 'of', 'to'].includes(w)
    );

  if (words.length <= 1) {
    return exactCond;
  }

  // Multi-word: match all significant words or their common synonyms
  const wordConditions = words.map((w) => {
    const termPatterns = [escapeRegex(w)];
    if (w === 'developer' || w === 'dev') {
      termPatterns.push('engineer', 'programmer', 'development');
    } else if (w === 'engineer') {
      termPatterns.push('developer', 'programmer', 'engineering');
    } else if (w === 'react' || w === 'reactjs') {
      termPatterns.push('frontend', 'mern');
    } else if (w === 'node' || w === 'nodejs') {
      termPatterns.push('backend', 'express', 'mern');
    } else if (w === 'frontend') {
      termPatterns.push('react', 'ui', 'web');
    } else if (w === 'backend') {
      termPatterns.push('node', 'server', 'api');
    } else if (w === 'fullstack' || w === 'full-stack') {
      termPatterns.push('mern', 'software');
    }

    const orTerm = termPatterns.map((p) => ({
      $or: [
        { title: { $regex: p, $options: 'i' } },
        { skills: { $regex: p, $options: 'i' } },
        { description: { $regex: p, $options: 'i' } },
        { category: { $regex: p, $options: 'i' } },
        { company: { $regex: p, $options: 'i' } },
      ],
    }));

    return { $or: orTerm };
  });

  return {
    $or: [exactCond, { $and: wordConditions }],
  };
};

const createJob = async (jobData) => {
  return await Job.create(jobData);
};

const getAllJobs = async (filters = {}) => {
  const buildQuery = (f) => {
    const andConditions = [];

    // Search keyword across title, description, company, skills, category
    const keyword = f.search || f.keyword || f.q || f.skills;
    if (keyword) {
      const kwCond = buildKeywordCondition(keyword);
      if (kwCond) andConditions.push(kwCond);
    }

    // Location filter
    if (f.location) {
      const locPatterns = mapLocationFilter(f.location);
      if (locPatterns.length > 0) {
        andConditions.push({
          $or: locPatterns.map((p) => ({ location: { $regex: p, $options: 'i' } })),
        });
      }
    }

    // Experience filter
    if (f.experience) {
      const expPatterns = mapExperienceFilter(f.experience);
      if (expPatterns.length > 0) {
        andConditions.push({
          $or: expPatterns.map((p) => ({ experience: { $regex: p, $options: 'i' } })),
        });
      }
    }

    // Job Type filter
    if (f.jobType) {
      const types = f.jobType
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
    if (f.category) {
      const categories = f.category
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

    if (f.title && !keyword) {
      const safeTitle = escapeRegex(f.title);
      if (safeTitle) {
        andConditions.push({ title: { $regex: safeTitle, $options: 'i' } });
      }
    }

    if (f.company && !keyword) {
      const safeCompany = escapeRegex(f.company);
      if (safeCompany) {
        andConditions.push({ company: { $regex: safeCompany, $options: 'i' } });
      }
    }

    return andConditions.length > 0 ? { $and: andConditions } : {};
  };

  // 1. Strict Query
  const strictQuery = buildQuery(filters);
  let jobs = await Job.find(strictQuery).sort({ postedAt: -1 }).populate('createdBy', 'name email');

  // 2. Intelligent Relaxation if 0 results found when combining filters
  const keyword = filters.search || filters.keyword || filters.q || filters.skills;
  if (jobs.length === 0 && keyword && (filters.experience || filters.location || filters.category)) {
    // Attempt keyword + location (without experience restriction)
    if (filters.location && filters.experience) {
      const relaxedQ = buildQuery({ ...filters, experience: undefined });
      jobs = await Job.find(relaxedQ).sort({ postedAt: -1 }).populate('createdBy', 'name email');
    }
    // Attempt keyword + experience (without location restriction)
    if (jobs.length === 0 && filters.experience) {
      const relaxedQ = buildQuery({ ...filters, location: undefined });
      jobs = await Job.find(relaxedQ).sort({ postedAt: -1 }).populate('createdBy', 'name email');
    }
    // Attempt keyword alone
    if (jobs.length === 0) {
      const relaxedQ = buildQuery({ skills: keyword });
      jobs = await Job.find(relaxedQ).sort({ postedAt: -1 }).populate('createdBy', 'name email');
    }
  }

  // 3. Fallback for location alone if keyword was empty but location + experience returned 0
  if (jobs.length === 0 && !keyword && filters.location && filters.experience) {
    const relaxedQ = buildQuery({ location: filters.location });
    jobs = await Job.find(relaxedQ).sort({ postedAt: -1 }).populate('createdBy', 'name email');
  }

  return jobs;
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
