import nodemailer from 'nodemailer';

const allowedOrigins = [
  'http://localhost:5173',
  'https://event-sync-cwd7sp34i-manyamvamsi2s-projects.vercel.app'
];

// createHtmlBody function remains the same...
const createHtmlBody = (name, eventName, eventId) => `<div>...</div>`;

export default async function handler(req, res) {
  // Dynamic CORS Handling
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error sending verification email:', err);
    res.status(500).json({ error: 'Error sending email' });
  }
}
