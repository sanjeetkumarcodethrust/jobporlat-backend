import mongoose from 'mongoose';

const jobSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a job title'],
    },
    company: {
      type: String,
      required: [true, 'Please add a company name'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
    },
    salary: {
      type: String,
      required: [true, 'Please add a salary'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: String, // e.g., '0-2 years', '3-5 years', etc.
      default: 'Not specified',
    },
    jobType: {
      type: String, // e.g., 'Full-time', 'Part-time', 'Remote'
      default: 'Full-time',
    },
    category: {
      type: String,
      default: 'General',
    },
    postedAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Job', jobSchema);
