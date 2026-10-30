import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

dns.setServers(['8.8.8.8', '1.1.1.1']);

import Job from './models/Job.js';
import User from './models/User.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://sanjeetkum960_db_user:Sanju%40%231504@cluster0.elz8xr9.mongodb.net/jobportal?retryWrites=true&w=majority&appName=Cluster0';

const jobsData = [
  // ─── 1. PUNE ────────────────────────────────────────────────────────
  {
    title: 'Full Stack Developer (MERN)',
    company: 'Tech Mahindra',
    location: 'Hinjewadi, Pune, Maharashtra',
    salary: '₹7,00,000 - ₹12,00,000 P.A.',
    description: 'Tech Mahindra is hiring a skilled Full Stack MERN Developer in Hinjewadi, Pune. You will develop scalable web applications, collaborate with cross-functional teams, and integrate secure RESTful APIs with MongoDB and Node.js.',
    skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'REST APIs', 'Web Development'],
    experience: '1-3 years',
    jobType: 'Full-time',
    category: 'Software Development',
  },
  {
    title: 'Frontend Engineer (React.js & TypeScript)',
    company: 'Barclays',
    location: 'Magarpatta City, Pune, Maharashtra',
    salary: '₹9,00,000 - ₹15,00,000 P.A.',
    description: 'Join Barclays in Pune as a Frontend Engineer. Build high-performance banking and wealth management UI dashboards using React, TypeScript, and modern state management tools.',
    skills: ['React', 'TypeScript', 'Redux', 'Tailwind CSS', 'Next.js', 'HTML5', 'Web Development'],
    experience: '3-5 years',
    jobType: 'Full-time',
    category: 'Software Development',
  },
  {
    title: 'Junior Java Developer (Fresher)',
    company: 'Cognizant',
    location: 'Kharadi, Pune, Maharashtra',
    salary: '₹4,50,000 - ₹6,50,000 P.A.',
    description: 'Cognizant is welcoming enthusiastic Freshers and entry-level Java Developers for our Pune delivery center. You will work on enterprise client solutions and receive continuous learning mentorship.',
    skills: ['Java', 'Spring Boot', 'SQL', 'Hibernate', 'Git', 'OOP'],
    experience: 'Fresher / Entry Level (0-1 years)',
    jobType: 'Full-time',
    category: 'Software Development',
  },
  {
    title: 'DevOps & Cloud Engineer',
    company: 'Persistent Systems',
    location: 'Senapati Bapat Road, Pune, Maharashtra',
    salary: '₹10,00,000 - ₹18,00,000 P.A.',
    description: 'Persistent Systems is seeking a DevOps Engineer in Pune to automate cloud infrastructure, design resilient CI/CD pipelines, and manage containerized Kubernetes clusters on AWS.',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux'],
    experience: '3-5 years',
    jobType: 'Full-time',
    category: 'Software Development',
  },

  // ─── 2. BENGALURU (BANGALORE) ────────────────────────────────────────
  {
    title: 'Senior Full Stack Engineer',
    company: 'Swiggy',
    location: 'Koramangala, Bengaluru (Bangalore), Karnataka',
    salary: '₹18,00,000 - ₹30,00,000 P.A.',
    description: 'Swiggy is seeking an experienced Senior Full Stack Engineer in Koramangala, Bengaluru. Help power hyper-local logistics and real-time order processing serving millions of customers across India.',
    skills: ['Node.js', 'React', 'Microservices', 'PostgreSQL', 'Redis', 'AWS', 'Web Development'],
    experience: 'Senior Level (5+ years)',
    jobType: 'Full-time',
    category: 'Software Development',
  },
  {
    title: 'Frontend Developer (Next.js & React)',
    company: 'CRED',
    location: 'Indiranagar, Bengaluru (Bangalore), Karnataka',
    salary: '₹15,00,000 - ₹25,00,000 P.A.',
    description: 'CRED is looking for craft-focused Frontend Developers in Bengaluru. Build fluid, high-converting member interfaces with pixel-perfect animation and snappy web performance.',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Web Development'],
    experience: '3-5 years',
    jobType: 'Full-time',
    category: 'Software Development',
  },
  {
    title: 'Data Scientist / Machine Learning Engineer',
    company: 'Flipkart',
    location: 'Bellandur, Bengaluru (Bangalore), Karnataka',
    salary: '₹16,00,000 - ₹28,00,000 P.A.',
    description: 'Flipkart is looking for Data Scientists in Bengaluru to innovate recommendation engines, catalog search ranking, and fraud detection algorithms using large-scale machine learning and NLP.',
    skills: ['Python', 'Machine Learning', 'PyTorch', 'SQL', 'NLP', 'Data Science'],
    experience: '3-5 years',
    jobType: 'Full-time',
    category: 'Data Science',
  },
  {
    title: 'Associate Software Engineer (Fresher)',
    company: 'Infosys',
    location: 'Electronic City, Bengaluru (Bangalore), Karnataka',
    salary: '₹4,00,000 - ₹6,00,000 P.A.',
    description: 'Infosys invites aspiring engineers and fresh graduates to start their software careers in Bengaluru. Work on cutting-edge client platforms across cloud, web, and automation.',
    skills: ['Python', 'JavaScript', 'HTML/CSS', 'SQL', 'Problem Solving', 'Web Development'],
    experience: 'Fresher / Entry Level (0-1 years)',
    jobType: 'Full-time',
    category: 'Software Development',
  },
  {
    title: 'Product Designer (UI/UX)',
    company: 'Razorpay',
    location: 'HSR Layout, Bengaluru (Bangalore), Karnataka',
    salary: '₹12,00,000 - ₹20,00,000 P.A.',
    description: 'Design the future of payments in India at Razorpay in Bengaluru. Create effortless checkout experiences, developer portals, and merchant analytics dashboards.',
    skills: ['Figma', 'UI/UX', 'Design Systems', 'Wireframing', 'User Research'],
    experience: '1-3 years',
    jobType: 'Full-time',
    category: 'Design',
  },

  // ─── 3. HYDERABAD ───────────────────────────────────────────────────
  {
    title: 'Backend Engineer (Go & Node.js)',
    company: 'Microsoft',
    location: 'Gachibowli, Hyderabad, Telangana',
    salary: '₹20,00,000 - ₹35,00,000 P.A.',
    description: 'Microsoft India Development Center in Hyderabad is looking for a Backend Engineer to build high-scale cloud services, enterprise storage, and distributed telemetry pipelines on Azure.',
    skills: ['Go', 'Node.js', 'Azure', 'Distributed Systems', 'Kubernetes', 'Docker'],
    experience: 'Senior Level (5+ years)',
    jobType: 'Full-time',
    category: 'Software Development',
  },
  {
    title: 'Java Spring Boot Developer',
    company: 'Oracle',
    location: 'Hitec City, Hyderabad, Telangana',
    salary: '₹10,00,000 - ₹17,00,000 P.A.',
    description: 'Oracle Cloud Infrastructure team in Hyderabad is hiring Java Microservices Developers. Architect enterprise cloud database management and automated customer workflows.',
    skills: ['Java', 'Spring Boot', 'Microservices', 'Oracle DB', 'Kafka', 'REST APIs'],
    experience: '3-5 years',
    jobType: 'Full-time',
    category: 'Software Development',
  },
  {
    title: 'QA Automation Engineer',
    company: 'Deloitte',
    location: 'Madhapur, Hyderabad, Telangana',
    salary: '₹6,50,000 - ₹11,00,000 P.A.',
    description: 'Deloitte Hyderabad is looking for a QA Automation Engineer. Design automated end-to-end test suites, conduct API validation, and maintain regression test frameworks.',
    skills: ['Selenium', 'Cypress', 'JavaScript', 'Java', 'API Testing', 'Postman'],
    experience: '1-3 years',
    jobType: 'Full-time',
    category: 'Software Development',
  },
  {
    title: 'Data Analyst (Fresher / Junior)',
    company: 'Amazon',
    location: 'Financial District, Hyderabad, Telangana',
    salary: '₹5,50,000 - ₹8,50,000 P.A.',
    description: 'Amazon Operations in Hyderabad is hiring Data Analysts to model supply chain metrics, extract business insights via SQL and Python, and create executive KPI dashboards.',
    skills: ['SQL', 'Python', 'Excel', 'Tableau', 'Data Analysis', 'Power BI'],
    experience: 'Fresher / Entry Level (0-1 years)',
    jobType: 'Full-time',
    category: 'Data Science',
  },

  // ─── 4. CHENNAI ─────────────────────────────────────────────────────
  {
    title: 'Python Web Developer',
    company: 'Zoho',
    location: 'Estancia IT Park, Chennai, Tamil Nadu',
    salary: '₹6,00,000 - ₹11,00,000 P.A.',
    description: 'Zoho Corporation in Chennai is looking for backend engineers who love crafting clean, maintainable Python code for our suite of cloud business productivity products.',
    skills: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Redis', 'REST APIs'],
    experience: '1-3 years',
    jobType: 'Full-time',
    category: 'Software Development',
  },
  {
    title: 'Mobile Application Developer (React Native / Flutter)',
    company: 'Freshworks',
    location: 'Perungudi, OMR, Chennai, Tamil Nadu',
    salary: '₹8,00,000 - ₹15,00,000 P.A.',
    description: 'Freshworks Chennai is seeking a Mobile App Developer to build intuitive iOS and Android customer engagement apps with offline sync and push notification support.',
    skills: ['React Native', 'Flutter', 'iOS', 'Android', 'JavaScript', 'Mobile App'],
    experience: '1-3 years',
    jobType: 'Full-time',
    category: 'Software Development',
  },
  {
    title: 'Data Engineer (Big Data & Spark)',
    company: 'Cognizant',
    location: 'Sholinganallur, Chennai, Tamil Nadu',
    salary: '₹9,00,000 - ₹16,00,000 P.A.',
    description: 'Build enterprise big data ingestion pipelines, real-time analytics data lakes, and ETL workflows using Spark and Airflow at Cognizant Chennai.',
    skills: ['Apache Spark', 'Python', 'SQL', 'Airflow', 'AWS', 'Big Data'],
    experience: '3-5 years',
    jobType: 'Full-time',
    category: 'Data Science',
  },
  {
    title: 'Graduate Trainee Software Engineer (Fresher)',
    company: 'HCL Technologies',
    location: 'Ambattur, Chennai, Tamil Nadu',
    salary: '₹3,80,000 - ₹5,50,000 P.A.',
    description: 'HCL Technologies Chennai is welcoming fresh engineering graduates for global digital transformation projects. Robust training program and early project deployment.',
    skills: ['C++', 'Java', 'SQL', 'Data Structures', 'Web Development'],
    experience: 'Fresher / Entry Level (0-1 years)',
    jobType: 'Full-time',
    category: 'Software Development',
  },

  // ─── 5. KOLKATA ─────────────────────────────────────────────────────
  {
    title: 'MERN Stack Web Developer',
    company: 'PwC India',
    location: 'Salt Lake Sector V, Kolkata, West Bengal',
    salary: '₹7,00,000 - ₹13,00,000 P.A.',
    description: 'PwC India Acceleration Center in Salt Lake, Kolkata is hiring MERN Stack Developers. Design robust cloud-native enterprise business applications and secure client portals.',
    skills: ['MongoDB', 'Express', 'React', 'Node.js', 'JavaScript', 'REST APIs', 'Web Development'],
    experience: '1-3 years',
    jobType: 'Full-time',
    category: 'Software Development',
  },
  {
    title: 'UI/UX Designer & Frontend Developer',
    company: 'Wipro',
    location: 'New Town, Kolkata, West Bengal',
    salary: '₹6,00,000 - ₹10,50,000 P.A.',
    description: 'Wipro Kolkata is seeking a hybrid UI/UX Designer and Web Developer to create accessible, elegant user interfaces and translate design wireframes into clean React code.',
    skills: ['Figma', 'React', 'HTML/CSS', 'Tailwind CSS', 'UI/UX Design', 'Web Development'],
    experience: '1-3 years',
    jobType: 'Full-time',
    category: 'Design',
  },
  {
    title: 'Associate Software Engineer (Fresher)',
    company: 'Tata Consultancy Services (TCS)',
    location: 'Rajarhat, Kolkata, West Bengal',
    salary: '₹4,00,000 - ₹6,20,000 P.A.',
    description: 'TCS Kolkata is hiring freshers for software development, cloud operations, and enterprise software maintenance. Join India’s largest IT services leader.',
    skills: ['JavaScript', 'Java', 'SQL', 'HTML5', 'Problem Solving', 'Web Development'],
    experience: 'Fresher / Entry Level (0-1 years)',
    jobType: 'Full-time',
    category: 'Software Development',
  },
  {
    title: 'Cloud & Infrastructure Specialist',
    company: 'ITC Infotech',
    location: 'Jadavpur, Kolkata, West Bengal',
    salary: '₹8,00,000 - ₹14,00,000 P.A.',
    description: 'ITC Infotech in Kolkata is hiring a Cloud Infrastructure Specialist to administer hybrid enterprise cloud deployments, optimize server cost, and maintain security compliance.',
    skills: ['Azure', 'Linux', 'PowerShell', 'Networking', 'Cloud Infrastructure'],
    experience: '3-5 years',
    jobType: 'Full-time',
    category: 'Software Development',
  },

  // ─── 6. MUMBAI ──────────────────────────────────────────────────────
  {
    title: 'Frontend Architect (React & Performance)',
    company: 'Jio Platforms',
    location: 'Navi Mumbai, Mumbai, Maharashtra',
    salary: '₹16,00,000 - ₹28,00,000 P.A.',
    description: 'Jio Platforms in Mumbai is seeking a Lead Frontend Architect to scale consumer apps reaching 400M+ users with low-latency rendering and progressive web capabilities.',
    skills: ['React', 'Next.js', 'Web Performance', 'Micro Frontends', 'TypeScript', 'Web Development'],
    experience: 'Senior Level (5+ years)',
    jobType: 'Full-time',
    category: 'Software Development',
  },
  {
    title: 'Financial Software Developer (C++ / Python)',
    company: 'Morgan Stanley',
    location: 'Bandra Kurla Complex (BKC), Mumbai, Maharashtra',
    salary: '₹18,00,000 - ₹32,00,000 P.A.',
    description: 'Morgan Stanley BKC Mumbai is hiring quantitative and financial software developers to engineer algorithmic trading platforms, risk calculation engines, and order management tools.',
    skills: ['Python', 'C++', 'SQL', 'FinTech', 'Algorithms', 'High Frequency'],
    experience: '3-5 years',
    jobType: 'Full-time',
    category: 'Software Development',
  },
  {
    title: 'Digital Marketing & Growth Manager',
    company: 'Nykaa',
    location: 'Lower Parel, Mumbai, Maharashtra',
    salary: '₹8,00,000 - ₹14,00,000 P.A.',
    description: 'Drive customer acquisition and high-ROI digital campaigns at Nykaa Mumbai. Manage paid advertising, influencer collabs, and performance conversion funnel optimization.',
    skills: ['SEO', 'SEM', 'Google Ads', 'Content Strategy', 'Growth Marketing'],
    experience: '1-3 years',
    jobType: 'Full-time',
    category: 'Marketing',
  },

  // ─── 7. DELHI / NCR (GURGAON & NOIDA) ───────────────────────────────
  {
    title: 'Senior Backend Engineer (Node.js & Microservices)',
    company: 'Paytm',
    location: 'Noida (Delhi NCR), Uttar Pradesh',
    salary: '₹14,00,000 - ₹24,00,000 P.A.',
    description: 'Paytm in Noida is hiring Backend Engineers to build ultra-fast, fault-tolerant payments processing microservices capable of handling millions of UPI transactions per minute.',
    skills: ['Node.js', 'Microservices', 'Kafka', 'MongoDB', 'Redis', 'Docker'],
    experience: '3-5 years',
    jobType: 'Full-time',
    category: 'Software Development',
  },
  {
    title: 'Senior Product Manager',
    company: 'MakeMyTrip',
    location: 'Cyber City, Gurgaon (Delhi NCR), Haryana',
    salary: '₹22,00,000 - ₹38,00,000 P.A.',
    description: 'MakeMyTrip Gurgaon is looking for an experienced Senior Product Manager to lead flight and hotel discovery features, international travel bookings, and consumer personalization.',
    skills: ['Product Management', 'Roadmapping', 'User Experience', 'Analytics', 'Agile'],
    experience: 'Senior Level (5+ years)',
    jobType: 'Full-time',
    category: 'Product',
  },
  {
    title: 'AI / ML Research Associate (Fresher / Junior)',
    company: 'Airtel Digital',
    location: 'Cyber Hub, Gurgaon (Delhi NCR), Haryana',
    salary: '₹6,50,000 - ₹10,00,000 P.A.',
    description: 'Airtel Digital in Gurgaon is hiring AI/ML Associates to train conversational bots, voice recognition models, and subscriber churn predictive analytics algorithms.',
    skills: ['Python', 'Machine Learning', 'Deep Learning', 'NLP', 'Data Science'],
    experience: 'Fresher / Entry Level (0-1 years)',
    jobType: 'Full-time',
    category: 'Data Science',
  },
];

async function seedJobs() {
  try {
    console.log('[MongoDB] Connecting to Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('[MongoDB] Connected successfully');

    // Find recruiter or system user
    let recruiter = await User.findOne({ role: 'recruiter' });
    if (!recruiter) {
      recruiter = await User.findOne({ email: 'system@jobportal.com' });
    }
    if (!recruiter) {
      recruiter = await User.findOne({});
    }
    if (!recruiter) {
      recruiter = await User.create({
        name: 'Talent Acquisition Team',
        email: 'recruiter@jobportal.com',
        password: 'Password@123',
        role: 'recruiter',
      });
      console.log('[User] Created recruiter account:', recruiter.email);
    } else {
      console.log('[User] Using creator:', recruiter.name, `(${recruiter.email})`);
    }

    const formattedJobs = jobsData.map((job) => ({
      ...job,
      createdBy: recruiter._id,
      postedAt: new Date(),
    }));

    // Clean up any existing records of these specific jobs to ensure idempotency
    const jobTitles = jobsData.map(j => j.title);
    const companies = jobsData.map(j => j.company);
    await Job.deleteMany({ title: { $in: jobTitles }, company: { $in: companies } });

    // Insert jobs into MongoDB
    console.log(`[Seed] Inserting ${formattedJobs.length} jobs across Pune, Bengaluru, Hyderabad, Chennai, Kolkata, Mumbai, Delhi NCR...`);
    const inserted = await Job.insertMany(formattedJobs);
    console.log(`[Seed] SUCCESS! Inserted ${inserted.length} jobs.`);

    // Verification
    const count = await Job.countDocuments();
    console.log(`[Verification] Total jobs now in database: ${count}`);

    const cities = ['Pune', 'Bengaluru', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Mumbai', 'Delhi', 'Gurgaon', 'Noida'];
    console.log('\n[Verification] Job counts by city keyword:');
    for (const city of cities) {
      const cityCount = await Job.countDocuments({ location: { $regex: city, $options: 'i' } });
      console.log(`  - ${city}: ${cityCount} jobs`);
    }

    process.exit(0);
  } catch (err) {
    console.error('[Error] Seeding failed:', err);
    process.exit(1);
  }
}

seedJobs();
