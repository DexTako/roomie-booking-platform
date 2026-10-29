// Emails about bookings (sent only when email is set up; they never block a booking).
const { sendMail, isMailConfigured } = require('./mailer');
const User = require('../models/User');
const Room = require('../models/Room');

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
const money = (n) => `$${Number(n || 0).toFixed(2)}`;
const siteUrl = () => (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0].trim().replace(/\/$/, '');
const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const send = async (to, subject, lines) => {
  if (!to || !isMailConfigured()) return;
  try {
    const html =
      `<div style="font-family:system-ui,Arial,sans-serif;max-width:520px;margin:auto;color:#111">` +
      `<h2 style="color:#2563eb;margin-bottom:4px">Roomie</h2>` +
      lines.map((l) => `<p style="margin:8px 0">${escapeHtml(l)}</p>`).join('') +
      `<p style="margin:16px 0"><a href="${siteUrl()}" style="color:#2563eb">Open Roomie</a></p></div>`;
    await sendMail({ to, subject, text: lines.join('\n'), html });
  } catch (error) {
    console.error('[Roomie] Notification email failed:', error.message);
  }
};

const summary = (b) => [
  `Room: ${b.roomName}`,
  `Dates: ${fmtDate(b.checkIn)} to ${fmtDate(b.checkOut)} (${b.nights} night${b.nights === 1 ? '' : 's'})`,
  `Guests: ${b.guests}`,
  `Total: ${money(b.totalPrice)}`,
  `Payment: ${b.paymentDetails || b.paymentMethod}`
];

const getHostEmail = async (roomId) => {
  const room = await Room.findById(roomId).select('hostId');
  if (!room) return null;
  const host = await User.findById(room.hostId).select('email');
  return host ? host.email : null;
};

// A guest sent a booking request: confirm to the guest, alert the host
exports.notifyBookingCreated = async (booking) => {
  try {
    await send(booking.renterEmail, `We received your booking request for ${booking.roomName}`, [
      `Hi ${booking.renterName}, thanks for your booking request.`,
      'It stays Pending until the host approves it. We will email you as soon as they answer.',
      ...summary(booking)
    ]);
    const hostEmail = await getHostEmail(booking.roomId);
    await send(hostEmail, `New booking request for ${booking.roomName}`, [
      `${booking.renterName} wants to book ${booking.roomName}.`,
      'Open your host dashboard to approve or decline the request.',
      ...summary(booking)
    ]);
  } catch (error) {
    console.error('[Roomie] Booking notification failed:', error.message);
  }
};

// Status changed. actor = 'guest' when the guest cancelled (then the host is told).
exports.notifyBookingStatus = async (booking, status, actor = 'host') => {
  try {
    if (status === 'approved') {
      await send(booking.renterEmail, `Your booking at ${booking.roomName} is approved`, [
        `Good news, ${booking.renterName}! The host approved your booking.`,
        ...summary(booking)
      ]);
    } else if (status === 'declined') {
      await send(booking.renterEmail, `Your booking at ${booking.roomName} was declined`, [
        `Hi ${booking.renterName}, the host could not accept your booking request.`,
        'If you paid, the host will refund you. You can look for other dates or rooms on Roomie.',
        ...summary(booking)
      ]);
    } else if (status === 'cancelled' && actor === 'guest') {
      const hostEmail = await getHostEmail(booking.roomId);
      await send(hostEmail, `${booking.renterName} cancelled their booking`, [
        `${booking.renterName} cancelled a booking for ${booking.roomName}. The dates are free again.`,
        ...summary(booking)
      ]);
    } else if (status === 'cancelled') {
      await send(booking.renterEmail, `Your booking at ${booking.roomName} was cancelled`, [
        `Hi ${booking.renterName}, your booking was cancelled.`,
        ...summary(booking)
      ]);
    }
  } catch (error) {
    console.error('[Roomie] Booking status notification failed:', error.message);
  }
};
