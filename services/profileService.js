import Profile from '../models/Profile.js';

// Get profile by user ID
const getProfile = async (userId) => {
  const profile = await Profile.findOne({ user: userId }).populate(
    'user',
    'name email role'
  );

  if (!profile) {
    return null;
  }

  return profile;
};

// Create or update profile
const createOrUpdateProfile = async (userId, profileData) => {
  const {
    headline,
    bio,
    phone,
    location,
    skills,
    socialLinks,
  } = profileData;

  const profileFields = { user: userId };

  if (headline !== undefined) profileFields.headline = headline;
  if (bio !== undefined) profileFields.bio = bio;
  if (phone !== undefined) profileFields.phone = phone;
  if (location !== undefined) profileFields.location = location;
  if (socialLinks !== undefined) profileFields.socialLinks = socialLinks;

  // Handle skills — accept comma-separated string or array
  if (skills !== undefined) {
    if (typeof skills === 'string') {
      profileFields.skills = skills.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (Array.isArray(skills)) {
      profileFields.skills = skills.map((s) => s.trim()).filter(Boolean);
    }
  }

  let profile = await Profile.findOne({ user: userId });

  if (profile) {
    // Update
    profile = await Profile.findOneAndUpdate(
      { user: userId },
      { $set: profileFields },
      { new: true, runValidators: true }
    ).populate('user', 'name email role');
  } else {
    // Create
    profile = await Profile.create(profileFields);
    profile = await profile.populate('user', 'name email role');
  }

  return profile;
};

// Add experience
const addExperience = async (userId, experienceData) => {
  const profile = await Profile.findOne({ user: userId });

  if (!profile) {
    throw new Error('Profile not found. Please create a profile first.');
  }

  profile.experience.unshift(experienceData);
  await profile.save();

  return profile;
};

// Delete experience
const deleteExperience = async (userId, expId) => {
  const profile = await Profile.findOne({ user: userId });

  if (!profile) {
    throw new Error('Profile not found');
  }

  const expIndex = profile.experience.findIndex(
    (exp) => exp._id.toString() === expId
  );

  if (expIndex === -1) {
    throw new Error('Experience entry not found');
  }

  profile.experience.splice(expIndex, 1);
  await profile.save();

  return profile;
};

// Add education
const addEducation = async (userId, educationData) => {
  const profile = await Profile.findOne({ user: userId });

  if (!profile) {
    throw new Error('Profile not found. Please create a profile first.');
  }

  profile.education.unshift(educationData);
  await profile.save();

  return profile;
};

// Delete education
const deleteEducation = async (userId, eduId) => {
  const profile = await Profile.findOne({ user: userId });

  if (!profile) {
    throw new Error('Profile not found');
  }

  const eduIndex = profile.education.findIndex(
    (edu) => edu._id.toString() === eduId
  );

  if (eduIndex === -1) {
    throw new Error('Education entry not found');
  }

  profile.education.splice(eduIndex, 1);
  await profile.save();

  return profile;
};

// Upload resume
const uploadResume = async (userId, filePath) => {
  let profile = await Profile.findOne({ user: userId });

  if (!profile) {
    // Auto-create a profile if one doesn't exist
    profile = await Profile.create({ user: userId, resumeUrl: filePath });
  } else {
    profile.resumeUrl = filePath;
    await profile.save();
  }

  return profile;
};

export { 
  getProfile,
  createOrUpdateProfile,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  uploadResume,
 };
