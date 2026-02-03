# Gmail & reCAPTCHA Setup Guide

## Step 1: Generate Gmail App Password

reCAPTCHA and Gmail are now configured for production. Follow these steps:

### 1.1 Enable 2-Step Verification (if not already enabled)

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** in left sidebar
3. Look for **2-Step Verification** and click it
4. Follow the prompts to enable

### 1.2 Generate App Password

1. Return to [Security](https://myaccount.google.com/security)
2. Scroll to **App passwords** (appears after 2FA is enabled)
3. Select:
   - App: **Mail**
   - Device: **Windows PC** (or your device type)
4. Click **Generate**
5. Copy the 16-character password shown

### 1.3 Set Netlify Environment Variables

1. Go to Netlify: **Site → Settings → Build & Deploy → Environment**
2. Add these variables:

```
GMAIL_USER = your-email@gmail.com
GMAIL_APP_PASSWORD = xxxx xxxx xxxx xxxx  (16-char password from 1.2)
CONTACT_EMAIL = your-email@gmail.com
REPLY_TO_EMAIL = your-email@gmail.com (optional)
```

## Step 2: Set Up reCAPTCHA v3

### 2.1 Create reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click **Create** (+) button
3. Fill in:
   - **Label**: NexusTech Contact Form
   - **reCAPTCHA type**: Select **reCAPTCHA v3**
   - **Domains**: 
     - yourdomain.com (production)
     - localhost (for testing)
4. Accept terms and click **Submit**

### 2.2 Copy Keys

After creation, you'll see:
- **Site Key** (public - goes in HTML)
- **Secret Key** (private - goes in backend)

### 2.3 Update Configuration

**Option A: Update directly in code**

In `public/index.html`, replace the Site Key:
```html
<!-- Current (test key): -->
<script src="https://www.google.com/recaptcha/api.js?render=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"></script>

<!-- Replace with your Site Key: -->
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>
```

Also in form submission (line ~595):
```javascript
const recaptchaToken = await grecaptcha.execute('YOUR_SITE_KEY', {action: 'submit'});
```

**Option B: Use Netlify environment variable** (recommended)

1. Add to Netlify env:
```
RECAPTCHA_SECRET_KEY = YOUR_SECRET_KEY
```

2. In `netlify/functions/contact.js`, the secret key is already configured

## Step 3: Deploy

### 3.1 Update package.json

Dependencies are already added (nodemailer, axios). Install locally:
```bash
npm install
```

### 3.2 Deploy to Netlify

```bash
npm run build
netlify deploy --prod
```

### 3.3 Verify Deployment

1. Go to your deployed site
2. Fill and submit the contact form
3. Check your Gmail inbox for:
   - Admin notification (with form details)
   - Confirmation email to user

## Step 4: Test Locally

### 4.1 Create `.env.local` file in root:

```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
RECAPTCHA_SECRET_KEY=your_secret_key
CONTACT_EMAIL=your-email@gmail.com
```

### 4.2 Install and run:

```bash
npm install
npm install -g netlify-cli
netlify dev
```

### 4.3 Test form at `http://localhost:8888`

## Security Notes

✅ **Gmail App Password** — Never share this, it's like a password  
✅ **reCAPTCHA Secret** — Keep in env vars only, never in code  
✅ **reCAPTCHA Score** — Threshold set at 0.5 (0 = bot, 1 = human)  
✅ **HTTPS** — Netlify enforces HTTPS automatically  
✅ **Email Security** — Gmail requires 2FA for app passwords  

## Troubleshooting

### "Error sending message"
- Check Gmail credentials in Netlify env vars
- Verify 2-Step Verification is enabled
- Ensure App Password (not regular password) is used
- Check Netlify Functions logs: **Site → Functions → contact**

### "Failed spam verification"
- reCAPTCHA score too low (you're blocking legitimate users)
- Check browser console for reCAPTCHA errors
- Verify Site Key is correct in HTML

### Emails not received
- Check spam/junk folder
- Gmail may block from Netlify IPs initially (whitelist sender)
- Verify `CONTACT_EMAIL` is correct

### "Can't connect to Gmail"
- Ensure Gmail user has 2FA enabled
- Verify App Password format (16 chars with spaces)
- Test credentials with Nodemailer locally

## Performance & Limits

- **Gmail**: 500 emails/day limit (more than enough for contact form)
- **reCAPTCHA**: No rate limit, free tier
- **Netlify Functions**: Cold starts ~1-2 sec, acceptable for forms

## Next Steps

- Monitor submissions in Netlify Functions logs
- Set up email forwarding if needed
- Add auto-reply template customization
- Consider Slack integration for notifications
