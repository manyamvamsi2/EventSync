import nodemailer from 'nodemailer';

const createApprovalHtml = (name) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
  <div style="background-color: #5cb85c; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">Account Approved!</h1>
  </div>
  <div style="padding: 24px;">
    <p>Hello ${name},</p>
    <p>Welcome to EventSync! Your account has been successfully approved.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://eventsync.vercel.app/login" style="background-color: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
        Login to Your Account
      </a>
    </div>
  </div>
  <div style="background-color: #f7f7f7; color: #777; padding: 15px; text-align: center; font-size: 12px;">
    <p style="margin: 0;">EventSync | Your Campus Connection</p>
  </div>
</div>
`;

const createRejectionHtml = (name) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
  <div style="background-color: #d9534f; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">Account Status Update</h1>
  </div>
  <div style="padding: 24px;">
    <p>Hello ${name},</p>
    <p>We regret to inform you that your registration for an EventSync account has been rejected.</p>
  </div>
  <div style="background-color: #f7f7f7; color: #777; padding: 15px; text-align: center; font-size: 12px;">
    <p style="margin: 0;">EventSync | Your Campus Connection</p>
  </div>
</div>
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, name, rejected } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Missing email or name' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com', port: 587,
    auth: { user: 'eventsync7@gmail.com', pass: '3NWO29BxThmcJKkE' },
  });

  const isRejected = rejected === true;
  const mailOptions = {
    from: `"EventSync" <eventsync7@gmail.com>`,
    to: email,
    subject: isRejected ? 'Your EventSync Account Request' : 'Welcome to EventSync! Your Account is Approved',
    html: isRejected ? createRejectionHtml(name) : createApprovalHtml(name),
    text: isRejected ? `Hello ${name},\n\nYour account request has been rejected.` : `Hello ${name},\n\nYour account has been approved. You can now log in: https://eventsync.vercel.app/login`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Error sending email', details: err.message });
  }
}
