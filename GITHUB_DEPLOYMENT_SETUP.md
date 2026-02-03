# GitHub Pages Deployment Setup

This project has been migrated from Netlify to GitHub Pages with GitHub Actions for CI/CD.

## Setup Steps

### 1. GitHub Pages Configuration
1. Go to your repository Settings → Pages
2. Select "Deploy from a branch" 
3. Set branch to `main` and folder to `/ (root)` (the workflow will handle `/dist`)
4. Wait for the first deployment

### 2. Contact Form API (Vercel)
Since GitHub Pages only hosts static files, the contact form API is deployed separately on **Vercel**:

1. Create a free account at [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Deploy the project (Vercel will detect `vercel.json` automatically)
4. Update `index.html` contact form endpoint:
   ```javascript
   const apiUrl = 'https://your-vercel-deployment.vercel.app/api/contact';
   ```

### 3. Environment Variables
Set these in your Vercel project settings:
- `GMAIL_USER` - Your Gmail address
- `GMAIL_APP_PASSWORD` - Your Google App Password (16 chars)
- `RECAPTCHA_SECRET_KEY` - reCAPTCHA v3 secret key
- `CONTACT_EMAIL` - Email to receive submissions
- `REPLY_TO_EMAIL` - Reply-to address (optional)

### 4. Custom Domain
To use a custom domain:
1. Update DNS records to point to GitHub Pages:
   - Add CNAME record with your domain
   - Or add A records with GitHub's IP addresses
2. In repository Settings → Pages, add your custom domain

## File Structure
```
├── .github/workflows/deploy.yml     # GitHub Actions workflow
├── vercel.json                      # Vercel configuration
├── api/contact.js                   # Contact form API (Vercel)
├── netlify/functions/               # OLD - can be deleted
├── netlify.toml                     # OLD - can be deleted
└── dist/                            # Built static files
```

## Continuous Deployment
- Push to `main` branch automatically triggers:
  1. GitHub Actions builds the project
  2. Deploys to GitHub Pages at `https://username.github.io/repo-name`
- Vercel auto-deploys when you push (if configured)

## Switching Back
If you need to revert to Netlify:
1. Keep the old `netlify.toml` and `netlify/functions/` files
2. They can coexist with new GitHub setup
