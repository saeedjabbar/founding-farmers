# Deployment Guide: Publishing The Chronicle

This guide covers multiple options for deploying your Chronicle timeline application to the web.

---

## Quick Start: Recommended Deployment Platform

**🚀 Best Option: Vercel** (Easiest for React apps)

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub, GitLab, or Bitbucket
3. Click "Add New Project"
4. Import your repository
5. Vercel auto-detects settings
6. Click "Deploy"
7. Your site goes live in ~2 minutes

**Live URL**: `your-project.vercel.app` (free custom domain available)

---

## Prerequisites

Before deploying, you need to:

### 1. Create a GitHub Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit of The Chronicle"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/the-chronicle.git
git branch -M main
git push -u origin main
```

### 2. Add Required Files

You'll need to create a few configuration files for deployment:

#### **`package.json`** (if not exists)
```json
{
  "name": "the-chronicle",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.344.0",
    "motion": "^10.16.0",
    "recharts": "^2.12.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.5.0",
    "vite": "^5.3.0",
    "tailwindcss": "^4.0.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0"
  }
}
```

#### **`vite.config.ts`**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

#### **`tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

#### **`index.html`** (root directory)
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="The Chronicle - Interactive timeline for investigative journalism" />
    <title>The Chronicle</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>
```

#### **`main.tsx`** (root directory)
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## Deployment Options

### Option 1: Vercel (Recommended) ⭐

**Pros**: 
- Zero configuration for React
- Automatic HTTPS
- Global CDN
- Preview deployments for branches
- Free tier is generous

**Steps**:

1. **Push to GitHub** (see Prerequisites)

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel auto-detects: Framework = Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Click "Deploy"

3. **Custom Domain** (optional):
   - Go to Project Settings → Domains
   - Add your domain (e.g., `thechronicle.com`)
   - Update DNS records as instructed
   - Vercel handles SSL automatically

**Environment Variables** (if needed):
- Go to Project Settings → Environment Variables
- Add any API keys or config

**Cost**: Free for personal projects

---

### Option 2: Netlify

**Pros**:
- Similar to Vercel
- Great for static sites
- Form handling built-in
- Free tier

**Steps**:

1. **Push to GitHub**

2. **Deploy via Netlify**:
   - Go to [app.netlify.com/start](https://app.netlify.com/start)
   - Connect to GitHub
   - Select repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

3. **Custom Domain**:
   - Site Settings → Domain Management
   - Add custom domain
   - Update DNS

**netlify.toml** (optional, in root):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Cost**: Free for personal projects

---

### Option 3: GitHub Pages

**Pros**:
- Completely free
- Easy if already using GitHub
- Good for open source projects

**Cons**:
- Slightly more setup
- No server-side features

**Steps**:

1. **Install gh-pages**:
```bash
npm install --save-dev gh-pages
```

2. **Update package.json**:
```json
{
  "homepage": "https://YOUR_USERNAME.github.io/the-chronicle",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. **Update vite.config.ts**:
```typescript
export default defineConfig({
  base: '/the-chronicle/', // repository name
  plugins: [react()],
  // ... rest of config
})
```

4. **Deploy**:
```bash
npm run deploy
```

5. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from branch
   - Branch: `gh-pages`
   - Save

**Live URL**: `https://YOUR_USERNAME.github.io/the-chronicle`

**Cost**: Free

---

### Option 4: Cloudflare Pages

**Pros**:
- Extremely fast global CDN
- Generous free tier
- Great analytics

**Steps**:

1. **Push to GitHub**

2. **Deploy via Cloudflare**:
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Pages → Create a project
   - Connect to GitHub
   - Build settings:
     - Build command: `npm run build`
     - Output directory: `dist`
   - Deploy

**Cost**: Free (unlimited bandwidth)

---

### Option 5: Railway

**Pros**:
- Easy deployment
- Good for full-stack apps
- PostgreSQL database included

**Steps**:

1. **Push to GitHub**

2. **Deploy via Railway**:
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub
   - Select repository
   - Add environment variables if needed
   - Deploy

**Cost**: $5/month (free trial available)

---

## Post-Deployment Checklist

### 1. **Test Your Site**
- [ ] Homepage loads correctly
- [ ] All themes work
- [ ] Timeline scrolls smoothly
- [ ] Source cards expand/collapse
- [ ] Mobile responsive
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

### 2. **Performance Optimization**
- [ ] Enable caching headers
- [ ] Compress images (if any)
- [ ] Minify CSS/JS (build process handles this)
- [ ] Enable Brotli compression

### 3. **SEO & Meta Tags**
Add to `index.html`:
```html
<meta name="description" content="The Chronicle - An interactive timeline for investigative journalism" />
<meta property="og:title" content="The Chronicle" />
<meta property="og:description" content="Interactive timeline for investigative journalism" />
<meta property="og:type" content="website" />
<meta property="og:image" content="/og-image.png" />
<meta name="twitter:card" content="summary_large_image" />
```

### 4. **Analytics** (optional)
- Google Analytics
- Plausible Analytics (privacy-friendly)
- Cloudflare Web Analytics (free)

### 5. **Custom Domain**
Example DNS settings (for Vercel):
```
Type  Name  Value
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
```

---

## Connecting Data (Spreadsheet Integration)

Since The Chronicle is designed to be data-driven:

### Google Sheets Integration

1. **Make Sheet Public**:
   - File → Share → Publish to web
   - Choose: Entire document, CSV format
   - Copy the CSV URL

2. **Fetch Data in App**:
```typescript
// Add to App.tsx or create /lib/data.ts
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/YOUR_ID/export?format=csv';

async function fetchTimelineData() {
  const response = await fetch(SHEET_URL);
  const csv = await response.text();
  // Parse CSV to JSON
  return parseCSV(csv);
}
```

3. **Alternative: Airtable**
- Use Airtable API
- More structured than Google Sheets
- Built-in API endpoints

### Static Data (Simplest)
Create `/data/timeline.json`:
```json
[
  {
    "date": "2024-01-15",
    "title": "First Event",
    "body_text": "Description...",
    "source_title": "Document Name",
    "source_summary": "Summary...",
    "source_type": "pdf",
    "source_url": "https://..."
  }
]
```

Import in App:
```typescript
import timelineData from './data/timeline.json';
```

---

## Continuous Deployment

Once set up, any deployment platform will automatically:

1. **Watch your GitHub repo**
2. **Build on every push** to main branch
3. **Deploy new version** automatically
4. **Rollback** if build fails

**Workflow**:
```bash
# Make changes locally
git add .
git commit -m "Update timeline design"
git push origin main

# Platform auto-deploys in ~2 minutes
# New version is live!
```

---

## Troubleshooting

### Build Fails

**Error: "Module not found"**
```bash
# Install missing dependencies
npm install
```

**Error: "TypeScript errors"**
```bash
# Fix type errors or temporarily disable strict mode
# in tsconfig.json: "strict": false
```

### Site Works Locally But Not in Production

1. **Check build output**:
```bash
npm run build
npm run preview  # Test production build locally
```

2. **Check paths**: Use relative paths, not absolute
   - ✅ `./components/...`
   - ❌ `/components/...`

3. **Check environment variables**: Add them in platform dashboard

### Fonts Not Loading

Add to `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600&display=swap" rel="stylesheet">
```

---

## Recommended Next Steps

1. **Deploy to Vercel** (easiest path)
2. **Add your timeline data** (Google Sheets or JSON)
3. **Set up custom domain**
4. **Share with the world!**

---

## Cost Summary

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| **Vercel** | Unlimited projects, 100GB bandwidth | $20/mo Pro |
| **Netlify** | 100GB bandwidth, 300 build minutes | $19/mo Pro |
| **GitHub Pages** | Unlimited (public repos) | N/A |
| **Cloudflare Pages** | Unlimited bandwidth | $20/mo for add-ons |
| **Railway** | $5 free credit | $5/mo + usage |

**Recommendation**: Start with Vercel's free tier. Upgrade only if you exceed limits.

---

## Support & Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Vite Deployment**: [vitejs.dev/guide/static-deploy](https://vitejs.dev/guide/static-deploy.html)

---

**Last Updated**: October 24, 2025  
**Application**: The Chronicle Timeline  
**Framework**: React + TypeScript + Vite + Tailwind CSS v4
