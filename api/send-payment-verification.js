import nodemailer from 'nodemailer';

const createHtmlBody = (name, eventName, eventId) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #5cb85c; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">Payment Verified!</h1>
  </div>
  <div style="padding: 20px;">
    <p>Hello ${name},</p>
    <p>Your payment for "<b>${eventName}</b>" has been verified.</p>
    <p>You can now access your unique QR code for check-in.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://eventsync.vercel.app/events/${eventId}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Get Your QR Code
      </a>
    </div>
  </div>
</div>
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, name, eventName, eventId } = req.body;

  if (!email || !name || !eventName || !eventId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com', port: 587,
    auth: { user: 'eventsync7@gmail.com', pass: '3NWO29BxThmcJKkE' },
  });

  const mailOptions = {
    from: '"EventSync" <eventsync7@gmail.com>',
    to: email,
    subject: `✅ Payment Verified for ${eventName}`,
    html: createHtmlBody(name, eventName, eventId),
    text: `Hello ${name},\n\nYour payment for "${eventName}" has been verified. Get your QR code from the event page: https://eventsync.vercel.app/events/${eventId}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Verification email sent.' });
  } catch (err) {
    console.error('Error sending verification email:', err);
    res.status(500).json({ error: 'Error sending email', details: err.message });
  }
}
