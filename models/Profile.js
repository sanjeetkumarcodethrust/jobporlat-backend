import mongoose from 'mongoose';

const profileSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    headline: {
      type: String,
      maxlength: [120, 'Headline cannot exceed 120 characters'],
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    phone: {
      type: String,
    },
    location: {
      type: String,
    },
    skills: {
      type: [String],
      default: [],
    },
    resumeUrl: {
      type: String,
    },
    experience: [
      {
        title: {
          type: String,
          required: [true, 'Job title is required'],
        },
        company: {
          type: String,
          required: [true, 'Company name is required'],
        },
        location: {
          type: String,
        },
        from: {
          type: Date,
          required: [true, 'Start date is required'],
        },
        to: {
          type: Date,
        },
        current: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
        },
      },
    ],
    education: [
      {
        institution: {
          type: String,
          required: [true, 'Institution name is required'],
        },
        degree: {
          type: String,
          required: [true, 'Degree is required'],
        },
        fieldOfStudy: {
          type: String,
        },
        from: {
          type: Date,
          required: [true, 'Start date is required'],
        },
        to: {
          type: Date,
        },
        description: {
          type: String,
        },
      },
    ],
    socialLinks: {
      linkedin: { type: String },
      github: { type: String },
      portfolio: { type: String },
      twitter: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose;.model('Profile', profileSchema);
