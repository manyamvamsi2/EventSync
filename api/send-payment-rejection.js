import nodemailer from 'nodemailer';

const createHtmlBody = (name, eventName, reason, clubDetails) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #d9534f; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">Payment Rejected</h1>
  </div>
  <div style="padding: 20px;">
    <p>Hello ${name},</p>
    <p>Your payment for "<b>${eventName}</b>" has been rejected.</p>
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0;"><b>Rejection Reason:</b><br/><i>${reason}</i></p>
    </div>
    <p>Please contact the event organizers directly if you have questions.</p>
    ${clubDetails ? `
    <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
      <h3 style="margin-bottom: 10px;">Club Contact:</h3>
      <p style="margin: 5px 0;"><b>President:</b> ${clubDetails.president || 'N/A'}</p>
      <p style="margin: 5px 0;"><b>Phone:</b> ${clubDetails.phoneNo || 'N/A'}</p>
    </div>` : ''}
  </div>
</div>
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, name, eventName, rejectionReason, clubDetails } = req.body;

  if (!email || !name || !eventName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com', port: 587,
    auth: { user: 'eventsync7@gmail.com', pass: '3NWO29BxThmcJKkE' },
  });

  const reasonText = rejectionReason || 'Please check your transaction details and try again.';
  const mailOptions = {
    from: '"EventSync" <eventsync7@gmail.com>',
    to: email,
    subject: `❗ Payment Rejected for ${eventName}`,
    html: createHtmlBody(name, eventName, reasonText, clubDetails),
    text: `Hello ${name},\n\nYour payment for "${eventName}" has been rejected.\n\nReason: ${reasonText}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Rejection email sent.' });
  } catch (err) {
    console.error('Error sending rejection email:', err);
    res.status(500).json({ error: 'Error sending email', details: err.message });
  }
}
