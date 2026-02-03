# Contact Form Production Guide

## Features

✅ **Client-side validation** — email, required fields, message length  
✅ **Spam protection** — honeypot field blocks bot submissions  
✅ **Error handling** — user-friendly error messages and recovery  
✅ **Success feedback** — toast-style status messages  
✅ **Prevent double-submit** — button disabled during submission  
✅ **Backend integration** — ready for email/CRM services  
✅ **Accessible** — proper labels, ARIA hints for errors

## Setup

### Option 1: Netlify Functions (Recommended)

1. Update `netlify.toml` if not already configured:
```toml
[functions]
  directory = "netlify/functions"
```

2. Install SendGrid (or your email service):
```bash
npm install @sendgrid/mail
```

3. Configure environment variables in Netlify:
   - `SENDGRID_API_KEY` — Your SendGrid API key
   - `CONTACT_EMAIL` — Destination email address

4. Update `netlify/functions/contact.js` with your email service

5. Deploy:
```bash
npm run build
netlify deploy --prod
```

### Option 2: Alternative Backend Services

- **AWS Lambda** + SES / SNS
- **Google Cloud Functions** + SendGrid
- **Firebase Functions** + Mailgun
- **Self-hosted** Node.js / Express

Update the fetch endpoint in `public/index.html`:
```javascript
// Change from:
const response = await fetch('/.netlify/functions/contact', ...)

// To your backend URL:
const response = await fetch('https://your-api.com/contact', ...)
```

### Option 3: Third-party Form Handlers

- **Formspree** — Free tier included, no backend needed
- **Basin** — Simple webhook-based form handling
- **Getform** — Spreadsheet integration

Update form action if using form-submission service:
```html
<form action="https://formspree.io/f/YOUR_ID" method="POST">
```

## Email Template Customization

Customize the email sent to admins by editing `netlify/functions/contact.js`:

```javascript
subject: `New Contact Form Submission - ${service}`,
html: `
  <h2>New Contact Form Submission</h2>
  <p><strong>Name:</strong> ${name}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
  <p><strong>Service Interest:</strong> ${service}</p>
  <p><strong>Message:</strong></p>
  <p>${message.replace(/\n/g, '<br>')}</p>
`
```

## Testing Locally

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Run locally:
```bash
netlify dev
# Opens http://localhost:8888
```

3. Test form submission — should hit your local function

## Security Checklist

- [ ] Email validation on both client and server
- [ ] Rate limiting enabled (Netlify automatically provides some)
- [ ] CORS headers configured properly
- [ ] API keys stored in environment variables (never hardcoded)
- [ ] Input sanitization (especially for database storage)
- [ ] HTTPS enforced (automatic on Netlify)
- [ ] Consider implementing reCAPTCHA v3 for additional spam protection

## Monitoring & Logging

Check submission logs in Netlify:
- Functions logs: Site → Functions → contact
- Browser console: Check for fetch errors

Add analytics by logging to database:
```javascript
// In contact.js
await db.contactSubmissions.insert({
  name, email, phone, service, message,
  submittedAt: new Date(),
  ip: event.headers['client-ip'],
  userAgent: event.headers['user-agent']
});
```

## Troubleshooting

**Form says "Error sending message"**
- Check browser console for network error
- Verify backend endpoint URL in index.html
- Test API endpoint directly with curl/Postman

**Emails not received**
- Verify `CONTACT_EMAIL` environment variable is set
- Check SendGrid account has remaining credits
- Look for emails in spam/junk folder

**CORS errors**
- Ensure backend includes proper CORS headers
- Test with `curl -i https://your-api.com/contact`

## Future Enhancements

- [ ] Add file upload support (attachments)
- [ ] reCAPTCHA v3 integration
- [ ] Slack/Discord webhook notifications
- [ ] Auto-reply email to user
- [ ] Form submission history/dashboard
- [ ] Multi-language support
