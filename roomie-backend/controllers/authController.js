const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendMail, mailStatus } = require('../utils/mailer');

// Generate JWT Token
const generateToken = (id, rememberMe = true) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: rememberMe ? '30d' : '1d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { password } = req.body;
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();

    // Validation - one clear message per problem
    if (!name || !email || !password) {
      const missing = [!name && 'name', !email && 'email', !password && 'password'].filter(Boolean);
      return res.status(400).json({
        success: false,
        message: `Please enter your ${missing.join(', ')}.`
      });
    }
    if (name.length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters long.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in instead.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (public registration is always 'customer' role)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'customer'
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    // Two sign-ups with the same email at the same moment
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in instead.'
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(' ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'We could not create your account right now. Please try again.',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email && !password) {
      return res.status(400).json({ success: false, message: 'Please enter your email and password.' });
    }
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please enter your email address.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Please enter your password.' });
    }

    // Find user (include password field for comparison)
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

    // Same wording for "no such email" and "wrong password" on purpose, so the
    // login form can't be used to find out which emails have accounts.
    const badCredentials = {
      success: false,
      message: 'Incorrect email or password. Please check your details, or create an account if you are new.'
    };

    if (!user) {
      return res.status(401).json(badCredentials);
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json(badCredentials);
    }

    // Only tell the owner of the account (correct password) that it is deactivated
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact support.'
      });
    }

    // Generate token
    const token = generateToken(user._id, req.body.rememberMe !== false);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        bio: user.bio,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'We could not log you in right now. Please try again.',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        bio: user.bio,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, bio, profilePicture } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update only allowed fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        bio: user.bio,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please enter your email address.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'That email doesn\'t look right. Use the format name@example.com.'
      });
    }

    // Same answer whether or not the email has an account, so this form can't be used
    // to find out who is registered.
    const message = 'If an account exists for that email, we\'ve sent a password reset link. It expires in 1 hour.';
    console.log(`[Roomie] Forgot password request received for "${email}".`);

    const user = await User.findOne({ email });
    if (!user || user.isActive === false) {
      // Nothing is emailed for unknown addresses (the visitor still sees the same message).
      console.log(`[Roomie] Forgot password: no active account for "${email}", so no email was sent.`);
      return res.status(200).json({ success: true, message });
    }

    // Random token; only its hash is saved, so a database leak can't be used to reset passwords
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    await User.updateOne(
      { _id: user._id },
      { $set: { resetPasswordToken: hashedToken, resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000) } }
    );

    const baseUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    const resetLink = `${baseUrl}/?reset=${token}`;

    let emailSent = false;
    try {
      const result = await sendMail({
        to: user.email,
        subject: 'Reset your Roomie password',
        text: `Hi ${user.name},\n\nUse this link to choose a new password (valid for 1 hour):\n${resetLink}\n\nIf you didn't ask for this, you can ignore this email.`,
        html: `<p>Hi ${user.name},</p><p><a href="${resetLink}">Click here to choose a new password</a> (valid for 1 hour).</p><p>If you didn't ask for this, you can ignore this email.</p>`
      });
      emailSent = result.sent;
      if (emailSent) console.log(`[Roomie] Password reset email sent to ${user.email}.`);
    } catch (mailError) {
      console.error('[Roomie] Could not send reset email:', mailError.message);
    }

    const response = { success: true, message };

    if (!emailSent) {
      // No email service set up (typical for a school project / local demo)
      const status = mailStatus();
      console.log(`[Roomie] Email not sent${status.reason ? ' (' + status.reason + ')' : ''}.`);
      console.log(`[Roomie] Password reset link for ${user.email}: ${resetLink}`);
      if (process.env.NODE_ENV !== 'production') {
        response.devResetLink = resetLink;
      }
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'We could not process your request right now. Please try again.'
    });
  }
};

// @desc    Reset password with the emailed token
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'This reset link is incomplete. Please request a new one.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Please enter your new password.' });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: `Your new password is too short (${password.length} of 6 characters). Please use at least 6 characters.`
      });
    }

    const hashedToken = crypto.createHash('sha256').update(String(token)).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'This reset link is invalid or has expired. Please request a new one.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword }, $unset: { resetPasswordToken: '', resetPasswordExpires: '' } }
    );

    res.status(200).json({
      success: true,
      message: 'Your password has been updated. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'We could not reset your password right now. Please try again.'
    });
  }
};

// @desc    Change password while logged in
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Please enter your current password.' });
    }
    if (!newPassword) {
      return res.status(400).json({ success: false, message: 'Please enter a new password.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: `Your new password is too short (${newPassword.length} of 6 characters). Please use at least 6 characters.`
      });
    }
    if (newPassword === currentPassword) {
      return res.status(400).json({
        success: false,
        message: 'Your new password must be different from your current password.'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = user && (await bcrypt.compare(currentPassword, user.password));
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Your current password is incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });

    res.status(200).json({ success: true, message: 'Your password has been changed.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'We could not change your password right now. Please try again.'
    });
  }
};
