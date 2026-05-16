import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    role: {
      type: String,
      enum: ['candidate', 'recruiter'],
      default: 'candidate',
    },
    // Extended Profile Fields
    profilePicture: { type: String, default: '' },
    resume: { type: String, default: '' },
    summary: { type: String, default: '' },
    about: { type: String, default: '' },
    skills: { type: [String], default: [] },
    education: [
      {
        degree: String,
        institution: String,
        year: String,
      }
    ],
    projects: [
      {
        title: String,
        description: String,
        link: String,
      }
    ],
    certifications: { type: [String], default: [] },
    achievements: { type: [String], default: [] },
    hobbies: { type: [String], default: [] },
    jobPreferences: {
      jobTypes: { type: [String], default: [] },
      locations: { type: [String], default: [] },
      expectedCTC: { type: String, default: '' },
      currentCTC: { type: String, default: '' },
    }
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
