import nodemailer from 'nodemailer';

const allowedOrigins = [
  'http://localhost:5173',
  'https://event-sync-cwd7sp34i-manyamvamsi2s-projects.vercel.app'
];

// Helper functions (formatDateTime, createHtmlBody) remain the same...
const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleDateString('en-US', options);
};
const createHtmlBody = (event) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
  <div style="padding: 24px;"><h1>You're Invited!</h1><p>A new event has been announced: <strong>${event.title}</strong></p><p><strong>Date:</strong> ${formatDateTime(event.startDate)}</p><p><strong>Location:</strong> ${event.location}</p><a href="https://eventsync.vercel.app/events/${event.id}">View Event</a></div>
</div>`;


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

  const { event, students } = req.body;
  if (!event || !students || !Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ error: 'Missing required data' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com', port: 587,
    auth: { user: 'eventsync7@gmail.com', pass: '3NWO29BxThmcJKkE' },
  });

  const mailOptions = {
    from: '"EventSync" <eventsync7@gmail.com>',
    bcc: students.map(s => s.email),
    subject: `📢 New Event: ${event.title}`,
    html: createHtmlBody(event),
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Error sending email' });
  }
}
