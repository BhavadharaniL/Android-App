const User = require('../models/User');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, college, degree, branch, currentYear } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      college: college || '',
      degree: degree || '',
      branch: branch || '',
      currentYear: currentYear || ''
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to CareerVerse.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        degree: user.degree,
        branch: user.branch,
        currentYear: user.currentYear,
        careerGoals: user.careerGoals,
        technicalSkills: user.technicalSkills
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        degree: user.degree,
        branch: user.branch,
        currentYear: user.currentYear,
        careerGoals: user.careerGoals,
        technicalSkills: user.technicalSkills,
        programmingLanguages: user.programmingLanguages,
        softSkills: user.softSkills,
        areasOfInterest: user.areasOfInterest,
        preferredRoles: user.preferredRoles,
        preferredLocations: user.preferredLocations,
        experienceLevel: user.experienceLevel,
        remotePreference: user.remotePreference
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Onboarding Profile (Skills, Goals, Preferences)
// @route   PUT /api/auth/onboarding
// @access  Private
exports.updateOnboarding = async (req, res, next) => {
  try {
    const {
      careerGoals,
      programmingLanguages,
      technicalSkills,
      softSkills,
      areasOfInterest,
      preferredRoles,
      preferredLocations,
      experienceLevel,
      remotePreference
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (careerGoals) user.careerGoals = careerGoals;
    if (programmingLanguages) user.programmingLanguages = programmingLanguages;
    if (technicalSkills) user.technicalSkills = technicalSkills;
    if (softSkills) user.softSkills = softSkills;
    if (areasOfInterest) user.areasOfInterest = areasOfInterest;
    if (preferredRoles) user.preferredRoles = preferredRoles;
    if (preferredLocations) user.preferredLocations = preferredLocations;
    if (experienceLevel) user.experienceLevel = experienceLevel;
    if (remotePreference) user.remotePreference = remotePreference;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Onboarding profile updated successfully.',
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update profile details
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    // Disallow password direct update via profile endpoint
    delete updates.password;
    delete updates.role;

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user
    });
  } catch (err) {
    next(err);
  }
};
