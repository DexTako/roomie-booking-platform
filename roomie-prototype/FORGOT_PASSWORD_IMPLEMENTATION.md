# Forgot Password Backend Implementation Guide

## Current Status: Frontend Ready ✅

The forgot password feature is now fully functional on the frontend with a beautiful modal UI. Currently, it simulates sending a reset email (demo mode).

---

## What You Need to Make It Work

To make this feature fully functional in production, you'll need to:

### 1. **Backend API Endpoint**

Create an endpoint to handle password reset requests:

```javascript
// Example with Express.js
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  // 1. Validate email
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  // 2. Check if user exists in database
  const user = await User.findOne({ email });
  if (!user) {
    // Security: Don't reveal if email exists or not
    return res.status(200).json({ 
      message: 'If that email exists, we sent a reset link' 
    });
  }
  
  // 3. Generate secure token (expires in 1 hour)
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // 4. Save hashed token and expiry to database
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 3600000; // 1 hour
  await user.save();
  
  // 5. Create reset URL
  const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
  
  // 6. Send email (see next section)
  await sendPasswordResetEmail(user.email, resetUrl);
  
  res.status(200).json({ 
    success: true,
    message: 'Password reset link sent to email' 
  });
});
```

---

### 2. **Email Service Integration**

Choose one of these popular email services:

#### **Option A: SendGrid** (Recommended for beginners)
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendPasswordResetEmail(email, resetUrl) {
  const msg = {
    to: email,
    from: 'noreply@roomie.com', // Your verified sender
    subject: 'Password Reset Request - Roomie',
    html: `
      <h2>Reset Your Password</h2>
      <p>You requested a password reset. Click the link below:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };
  
  await sgMail.send(msg);
}
```

**Setup:**
1. Sign up at [SendGrid](https://sendgrid.com)
2. Get API key from settings
3. Verify sender email address
4. Add to `.env`: `SENDGRID_API_KEY=your_key_here`
5. Install: `npm install @sendgrid/mail`

#### **Option B: Nodemailer** (More flexible)
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
  }
});

async function sendPasswordResetEmail(email, resetUrl) {
  await transporter.sendMail({
    from: '"Roomie" <noreply@roomie.com>',
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h2>Reset Your Password</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    `
  });
}
```

**Setup for Gmail:**
1. Enable 2-factor authentication on your Google account
2. Generate App Password: Google Account → Security → App passwords
3. Add to `.env`:
   ```
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```
4. Install: `npm install nodemailer`

#### **Option C: AWS SES** (Most scalable)
```javascript
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' });

async function sendPasswordResetEmail(email, resetUrl) {
  const params = {
    Source: 'noreply@roomie.com',
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: 'Password Reset Request - Roomie' },
      Body: {
        Html: {
          Data: `
            <h2>Reset Your Password</h2>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>This link expires in 1 hour.</p>
          `
        }
      }
    }
  };
  
  await ses.sendEmail(params).promise();
}
```

---

### 3. **Reset Password Page**

Create a new page to handle the actual password reset:

```javascript
// ResetPasswordPage.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Password reset successful!');
        navigate('/login');
      } else {
        setError(data.error || 'Reset failed');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };
  
  // ... render form ...
}
```

---

### 4. **Reset Password API Endpoint**

```javascript
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;
  
  // 1. Hash the token from URL
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  // 2. Find user with valid token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    return res.status(400).json({ 
      error: 'Token is invalid or has expired' 
    });
  }
  
  // 3. Update password (hash it first!)
  const bcrypt = require('bcrypt');
  user.password = await bcrypt.hash(password, 10);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  
  res.status(200).json({ 
    success: true,
    message: 'Password updated successfully' 
  });
});
```

---

### 5. **Update Frontend API Call**

In `ForgotPasswordModal.jsx`, replace the simulation with actual API call:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    setError('Please enter a valid email address')
    return
  }

  setIsLoading(true)
  setError('')

  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    const data = await response.json()

    if (response.ok) {
      setIsSuccess(true)
      onShowToast?.(`Password reset link sent to ${email}`, 'success')
      
      setTimeout(() => {
        onClose()
      }, 2000)
    } else {
      setError(data.error || 'Failed to send reset link')
    }
  } catch (err) {
    setError('Network error. Please try again.')
  } finally {
    setIsLoading(false)
  }
}
```

---

## Environment Variables You'll Need

Create a `.env` file:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/roomie

# Email Service (choose one)
SENDGRID_API_KEY=your_sendgrid_key
# OR
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_app_password
# OR
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret

# App
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

---

## Security Best Practices

1. **Token Expiry**: Always set token expiration (1 hour recommended)
2. **Hash Tokens**: Never store plain tokens in database
3. **Rate Limiting**: Prevent spam by limiting requests per IP
4. **No User Enumeration**: Don't reveal if email exists or not
5. **HTTPS Only**: Use secure connections in production
6. **Single Use Tokens**: Invalidate token after successful reset

---

## Testing Checklist

- [ ] User receives email with reset link
- [ ] Link expires after 1 hour
- [ ] Token is invalidated after use
- [ ] Invalid tokens show proper error
- [ ] Password meets requirements
- [ ] User can log in with new password
- [ ] Old password no longer works

---

## Current Demo Behavior

Right now, the frontend:
- ✅ Shows beautiful modal UI
- ✅ Validates email format
- ✅ Displays success message
- ✅ Shows loading states
- ⚠️ Simulates sending (no actual email)
- ⚠️ No backend integration yet

Once you implement the backend following this guide, the feature will be fully functional!

---

## Need Help?

Common issues:
- **Gmail blocking**: Enable "Less secure app access" or use App Password
- **SendGrid bounces**: Verify sender email address first
- **Token not found**: Check database connection and token hashing
- **Email not received**: Check spam folder, verify email service config

---

**Created:** September 25, 2026  
**Status:** Frontend Complete, Backend Pending
