import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from './models/Job.js';
import User from './models/User.js';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const crawlJobs = async () => {
  try {
    await connectDB();

    let allJobs = [];
    console.log('Fetching jobs from The Muse API...');
    
    // Fetch 25 pages to get 500 jobs (20 jobs per page)
    for (let i = 1; i <= 25; i++) {
      try {
        console.log(`Fetching page ${i}...`);
        const response = await axios.get(`https://www.themuse.com/api/public/jobs?page=${i}`);
        allJobs = [...allJobs, ...response.data.results];
      } catch (err) {
        console.error(`Failed to fetch page ${i}:`, err.message);
      }
    }

    if (allJobs.length === 0) {
      console.log('No jobs found.');
      process.exit();
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
    }

    console.log('Processing jobs to insert into DB...');
    const formattedJobs = allJobs.map(job => {
      const skills = [];
      const levels = job.levels && job.levels.length > 0 ? job.levels.map(l => l.name).join(', ') : 'Not specified';
      
      return {
        title: job.name || 'Untitled Job',
        company: job.company?.name || 'Unknown Company',
        location: job.locations && job.locations.length > 0 ? job.locations[0].name : 'Remote',
        salary: 'Competitive', // The Muse API doesn't usually provide salary
        description: job.contents || 'No description provided.',
        skills: skills,
        jobType: job.type || 'Full-time',
        experience: levels,
        category: job.categories && job.categories.length > 0 ? job.categories[0].name : 'General',
        postedAt: job.publication_date ? new Date(job.publication_date) : new Date(),
        createdBy: systemUser._id,
      };
    });

    console.log(`Inserting ${formattedJobs.length} jobs into the database...`);
    
    // Remove old system jobs before adding
    await Job.deleteMany({ createdBy: systemUser._id });

    await Job.insertMany(formattedJobs);
    
    console.log(`Successfully added ${formattedJobs.length} jobs to the database!`);
    process.exit();
  } catch (error) {
    console.error('Error crawling jobs:', error);
    process.exit(1);
  }
};

crawlJobs();
