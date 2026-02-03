

// Netlify Function: Handle contact form submissions with Gmail & reCAPTCHA
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
          // secret: process.env.RECAPTCHA_SECRET_KEY,
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

exports.handler = async (event, context) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { name, email, phone, service, message, recaptchaToken } = JSON.parse(event.body);

    // Basic validation
    if (!name?.trim() || !email?.trim() || !service || !message?.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

    // Verify reCAPTCHA
    if (!recaptchaToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'reCAPTCHA verification failed' })
      };
    }

    const isValidCaptcha = await verifyRecaptcha(recaptchaToken);
    if (!isValidCaptcha) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Failed spam verification. Please try again.' })
      };
    }

    // Send email to admin
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.CONTACT_EMAIL || process.env.GMAIL_USER,
      replyTo: email,
      subject: `[NexusTech] New Contact Form - ${service}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0f172a; border-bottom: 3px solid #06b6d4; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px; font-weight: bold; color: #0f172a; width: 30%;">Name:</td>
              <td style="padding: 10px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #0f172a;">Email:</td>
              <td style="padding: 10px;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px; font-weight: bold; color: #0f172a;">Phone:</td>
              <td style="padding: 10px;">${phone || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #0f172a;">Service:</td>
              <td style="padding: 10px;">${service}</td>
            </tr>
          </table>
          
          <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #06b6d4; margin: 20px 0;">
            <p style="margin-top: 0; font-weight: bold; color: #0f172a;">Message:</p>
            <p style="white-space: pre-wrap; color: #334155;">${message}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b;">
            This email was sent from the NexusTech contact form. 
            Submitted on ${new Date().toLocaleString()}
          </p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Optional: Send confirmation email to user
    const confirmationEmail = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'We received your message - KamTech',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0f172a;">Thank you for reaching out!</h2>
          <p>Hi ${name},</p>
          <p>We've received your message and appreciate your interest in KamTech.</p>
          <p>Our team will review your inquiry and get back to you within 24 business hours.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #06b6d4; margin: 20px 0;">
            <p style="margin: 0;"><strong>Service Interest:</strong> ${service}</p>
          </div>
          
          <p>If you have any urgent matters, feel free to reach out directly.</p>
          <p style="color: #64748b; font-size: 14px;">
            Best regards,<br>
            The NexusTech Team
          </p>
        </div>
      `
    };

    await transporter.sendMail(confirmationEmail);

    console.log(`Contact form submitted: ${email} - ${service}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Form submitted successfully. Thank you!'
      })
    };
  } catch (error) {
    console.error('Contact form error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to process submission. Please try again later.'
      })
    };
  }
};
