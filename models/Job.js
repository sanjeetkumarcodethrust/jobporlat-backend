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
