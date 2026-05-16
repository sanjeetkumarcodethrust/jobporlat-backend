import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Exclude password from the response
      const { password, ...userProfile } = user._doc;
      res.json(userProfile);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.profilePicture = req.body.profilePicture !== undefined ? req.body.profilePicture : user.profilePicture;
      user.resume = req.body.resume !== undefined ? req.body.resume : user.resume;
      user.summary = req.body.summary !== undefined ? req.body.summary : user.summary;
      user.about = req.body.about !== undefined ? req.body.about : user.about;
      user.skills = req.body.skills || user.skills;
      user.education = req.body.education || user.education;
      user.projects = req.body.projects || user.projects;
      user.certifications = req.body.certifications || user.certifications;
      user.achievements = req.body.achievements || user.achievements;
      user.hobbies = req.body.hobbies || user.hobbies;
      user.jobPreferences = req.body.jobPreferences || user.jobPreferences;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      const { password, ...userProfile } = updatedUser._doc;
      
      res.json({
        ...userProfile,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export { 
  registerUser,
  loginUser,
  getMe,
  updateProfile,
 };
