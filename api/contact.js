// GitHub Pages API Handler - Handle contact form submissions with Gmail & reCAPTCHA
// Deploy this as a Vercel function or use a serverless platform like Vercel/Supabase
// For now, this can be hosted on Vercel for free as a fallback
// Environment variables required:
//   GMAIL_USER - Gmail address (e.g., your-email@gmail.com)
//   GMAIL_APP_PASSWORD - 16-char Google App Password (not regular password)
//   RECAPTCHA_SECRET_KEY - reCAPTCHA v3 secret key
//   CONTACT_EMAIL - Where to send inquiries
//   REPLY_TO_EMAIL - Optional: reply address (defaults to GMAIL_USER)

const nodemailer = require('nodemailer');
const axios = require('axios');

// Initialize Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Verify reCAPTCHA token with Google
async function verifyRecaptcha(token) {
  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token
        }
      }
    );

    // Check if successful and score is above threshold (0.5 recommended)
    return response.data.success && response.data.score > 0.5;
  } catch (error) {
    console.error('reCAPTCHA verification failed:', error);
    return false;
  }
}

module.exports = async (req, res) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message, recaptchaToken } = req.body;

    // Validate required fields
    if (!name || !email || !message || !recaptchaToken) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify reCAPTCHA
    const isValidCaptcha = await verifyRecaptcha(recaptchaToken);
    if (!isValidCaptcha) {
      return res.status(400).json({ error: 'reCAPTCHA verification failed' });
    }

    // Send email to admin
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `New Contact Form Submission: ${subject || 'No subject'}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    });

    // Send confirmation email to user
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'We received your message',
      html: `
        <h2>Thank you for contacting us!</h2>
        <p>Hi ${name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p><strong>Your message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p>Best regards,<br>NexusTech Team</p>
      `
    });

    return res.status(200).json({ 
      success: true,
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ 
      error: 'Failed to process contact form',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
