Production build & deploy

Steps:

1. Install dev dependencies:

```bash
npm install
```

2. Build site (creates `dist/`):

```bash
npm run build
```

3. Serve locally for verification:

```bash
npm run start
# or
npx serve dist -s
```

Deployment options:
- Push to GitHub and let the workflow in `.github/workflows/deploy.yml` publish to GitHub Pages.
- Deploy `dist/` to Netlify (it will run `npm run build` and publish `dist/`).

Notes:
- Update `public/sitemap.xml` with the real site URL.
- Review 3rd-party CDNs and add SRI/integrity attributes if required.
