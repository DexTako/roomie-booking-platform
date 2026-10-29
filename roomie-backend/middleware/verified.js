// Blocks actions (like booking) until the user has confirmed their email address.
// Accounts created before this feature, and servers without email set up, count as verified.
module.exports = (req, res, next) => {
  if (req.user && req.user.isEmailVerified === false) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email address before booking. Check your inbox for the link, or press "Resend email" in the banner at the top of the page.'
    });
  }
  next();
};
