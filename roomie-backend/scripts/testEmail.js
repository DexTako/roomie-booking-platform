// Sends a test email so you can check your EMAIL_* settings.
// Usage:  npm run test-email            (sends to EMAIL_USER)
//         npm run test-email -- you@example.com
require('dotenv').config();
const { sendMail, mailStatus } = require('../utils/mailer');

(async () => {
  const status = mailStatus();
  if (!status.configured) {
    console.log('❌ Email is not set up yet:', status.reason);
    console.log('   Add these to roomie-backend/.env, then run this again:');
    console.log('   EMAIL_HOST=smtp.gmail.com');
    console.log('   EMAIL_PORT=587');
    console.log('   EMAIL_USER=yourname@gmail.com');
    console.log('   EMAIL_PASS=your-16-character-app-password');
    console.log('   EMAIL_FROM=Roomie <yourname@gmail.com>');
    process.exit(1);
  }

  const to = process.argv[2] || process.env.EMAIL_USER;
  try {
    await sendMail({
      to,
      subject: 'Roomie test email',
      text: 'If you can read this, Roomie can send emails.',
      html: '<p>If you can read this, <b>Roomie can send emails</b>.</p>'
    });
    console.log(`✅ Test email sent to ${to}. Check the inbox (and the spam folder).`);
  } catch (error) {
    console.error('❌ Could not send:', error.message);
    if (error.code === 'EAUTH' || /535|Invalid login|Username and Password/i.test(error.message)) {
      console.error('   Gmail rejected the login. Use an App Password (not your normal password):');
      console.error('   Google Account > Security > 2-Step Verification > App passwords. Paste it without spaces.');
    } else if (error.code === 'ESOCKET' || error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('   Could not reach the mail server. Check EMAIL_HOST/EMAIL_PORT and your internet or firewall.');
    }
    process.exit(1);
  }
})();
