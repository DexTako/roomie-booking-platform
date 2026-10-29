// Sends emails with nodemailer when it is installed and the EMAIL_* variables are set in .env.
// If not, nothing is sent and the caller can fall back (for example by logging the link).
let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch {
  // nodemailer not installed - run `npm install nodemailer` to enable real emails
}

const isMailConfigured = () =>
  Boolean(nodemailer && process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);

// Says exactly why email is not working (shown in the backend terminal)
const mailStatus = () => {
  if (!nodemailer) return { configured: false, reason: 'nodemailer is not installed (run: npm install nodemailer)' };
  const missing = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'].filter(name => !process.env[name]);
  if (missing.length > 0) return { configured: false, reason: `missing in .env: ${missing.join(', ')}` };
  return { configured: true, reason: '' };
};

const sendMail = async ({ to, subject, text, html }) => {
  if (!isMailConfigured()) return { sent: false };

  const port = Number(process.env.EMAIL_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  });
  return { sent: true };
};

module.exports = { sendMail, isMailConfigured, mailStatus };
