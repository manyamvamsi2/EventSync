import nodemailer from 'nodemailer';

const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  const options = {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  };
  return date.toLocaleDateString('en-US', options);
};

const createHtmlBody = (event) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
  ${event.image ? `<img src="${event.image}" alt="${event.title}" style="width: 100%; height: auto; max-height: 250px; object-fit: cover;">` : ''}
  <div style="padding: 24px;">
    <h1 style="font-size: 28px; color: #1a202c;">You're Invited!</h1>
    <p style="color: #555;">A new event has been announced on EventSync:</p>
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4f46e5;">
      <h2 style="font-size: 22px; color: #4f46e5;">${event.title}</h2>
      <p><strong>Date & Time:</strong> ${formatDateTime(event.startDate)}</p>
      <p><strong>Location:</strong> ${event.location}</p>
    </div>
    <a href="https://eventsync.vercel.app/events/${event.id}" style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
      View Event & Register
    </a>
  </div>
</div>
`;

export default async function handler(req, res) {
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
