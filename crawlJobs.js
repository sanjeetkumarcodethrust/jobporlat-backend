import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import connectDB from './config/db.js';
import Job from './models/Job.js';
import User from './models/User.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const client = axios.create({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
  },
  timeout: 15000,
});

const crawlJobs = async () => {
  try {
    const conn = await connectDB();
    if (!conn) {
      throw new Error(
        'Database connection failed. Please ensure MONGO_URI in .env is correct and Atlas network access allows your IP.'
      );
    }

    let allJobs = [];
    console.log('Fetching jobs from The Muse API...');

    // Fetch 25 pages to get up to 500 jobs (20 jobs per page)
    for (let i = 1; i <= 25; i++) {
      try {
        console.log(`Fetching page ${i}...`);
        const response = await client.get(
          `https://www.themuse.com/api/public/jobs?page=${i}`
        );
        const results = response.data?.results || [];
        allJobs = [...allJobs, ...results];
        // Short pause to avoid hitting rate limits
        await sleep(250);
      } catch (err) {
        console.error(`Failed to fetch page ${i}:`, err.message);
      }
    }

    if (allJobs.length === 0) {
      console.log('No jobs found or all requests were blocked.');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`Fetched ${allJobs.length} jobs total.`);

    // Get a user to act as the creator, or create a system user
    let systemUser = await User.findOne({ email: 'system@jobportal.com' });
    if (!systemUser) {
      systemUser = await User.create({
        name: 'System Admin',
        email: 'system@jobportal.com',
        password: 'password123',
        role: 'recruiter',
      });
      console.log('[User] Created system user:', systemUser.email);
    } else {
      console.log('[User] Using system user:', systemUser.email);
    }

    console.log('Processing jobs to insert into DB...');

    const commonKeywords = [
      'React',
      'Node.js',
      'JavaScript',
      'TypeScript',
      'Python',
      'Java',
      'C++',
      'C#',
      'Go',
      'Golang',
      'Ruby',
      'PHP',
      'SQL',
      'MongoDB',
      'PostgreSQL',
      'AWS',
      'Azure',
      'GCP',
      'Docker',
      'Kubernetes',
      'HTML',
      'CSS',
      'Tailwind CSS',
      'DevOps',
      'Sales',
      'Marketing',
      'Design',
      'Figma',
      'UI/UX',
      'Excel',
      'Product Management',
    ];

    const formattedJobs = allJobs.map((job) => {
      const levels =
        job.levels && job.levels.length > 0
          ? job.levels.map((l) => l.name).join(', ')
          : 'Not specified';

      const location =
        job.locations && job.locations.length > 0
          ? job.locations[0].name
          : 'Remote';

      const category =
        job.categories && job.categories.length > 0
          ? job.categories[0].name
          : 'General';

      // Normalize jobType
      let jobType = 'Full-time';
      const titleLower = (job.name || '').toLowerCase();
      if (titleLower.includes('part-time') || titleLower.includes('part time')) {
        jobType = 'Part-time';
      } else if (titleLower.includes('contract') || titleLower.includes('freelance')) {
        jobType = 'Contract';
      } else if (titleLower.includes('intern')) {
        jobType = 'Internship';
      } else if (location.toLowerCase().includes('remote')) {
        jobType = 'Remote';
      }

      // Extract skills from title, category, and contents
      const skillSet = new Set();
      if (category && category !== 'General') {
        skillSet.add(category);
      }
      const combinedText = `${job.name || ''} ${job.contents || ''}`;
      for (const kw of commonKeywords) {
        const regex = new RegExp(`\\b${kw.replace('++', '\\+\\+')}\\b`, 'i');
        if (regex.test(combinedText)) {
          skillSet.add(kw);
        }
      }

      return {
        title: job.name || 'Untitled Job',
        company: job.company?.name || 'Unknown Company',
        location: location,
        salary: 'Competitive',
        description: job.contents || 'No description provided.',
        skills: Array.from(skillSet),
        jobType: jobType,
        experience: levels,
        category: category,
        postedAt: job.publication_date ? new Date(job.publication_date) : new Date(),
        createdBy: systemUser._id,
      };
    });

    console.log(`Inserting ${formattedJobs.length} jobs into the database...`);

    // Remove old system jobs before adding fresh ones
    await Job.deleteMany({ createdBy: systemUser._id });

    const inserted = await Job.insertMany(formattedJobs);

    console.log(`Successfully added ${inserted.length} jobs to the database!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error crawling jobs:', error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

crawlJobs();
