# Deployment Guide

Complete guide for deploying the Transaction Website to production.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Frontend Deployment (Firebase Hosting)](#frontend-deployment-firebase-hosting)
- [Backend Deployment](#backend-deployment)
  - [Google Cloud Run](#google-cloud-run-recommended)
  - [Railway](#railway)
  - [Render](#render)
  - [Heroku](#heroku)
- [Database Setup](#database-setup)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

### Security Checklist

- [ ] All environment variables set correctly
- [ ] Production Firebase project created
- [ ] Firestore security rules configured
- [ ] Storage security rules configured
- [ ] CORS configured with production URLs
- [ ] Rate limiting enabled
- [ ] Helmet security headers enabled
- [ ] Service account key secured (never committed)
- [ ] Admin users created
- [ ] SSL/TLS certificates configured

### Code Checklist

- [ ] All tests passing (`npm test`)
- [ ] No console.log statements (use logger)
- [ ] Production build successful (`npm run build`)
- [ ] Dependencies up to date (`npm audit`)
- [ ] Log levels set to ERROR in production
- [ ] Error monitoring configured

### Firebase Checklist

- [ ] Authentication enabled (Email/Password)
- [ ] Firestore database created
- [ ] Cloud Storage bucket created
- [ ] Firebase Hosting configured
- [ ] Billing enabled (for backend services)

## Environment Configuration

### Production Environment Variables

#### Frontend (`.env.production`)

```env
# API Configuration (your deployed backend URL)
REACT_APP_API_URL=https://api.yourdomain.com

# Firebase Configuration (Production Project)
REACT_APP_FIREBASE_API_KEY=your_production_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-prod-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-prod-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-prod-project.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Logging (ERROR level for production)
REACT_APP_LOG_LEVEL=ERROR
```

#### Backend (`backend/.env.production`)

```env
# Server Configuration
PORT=5000
NODE_ENV=production
LOG_LEVEL=error

# Frontend URL (your deployed frontend URL)
FRONTEND_URL=https://yourdomain.com

# Email Service
RESEND_API_KEY=your_production_resend_key
RESEND_DOMAIN=noreply@yourdomain.com

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-prod-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-prod-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-prod-project.firebasestorage.app

# Admin Setup
ADMIN_EMAIL=admin@yourdomain.com
```

### Getting Production Credentials

#### Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your production project
3. Navigate to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file securely (DO NOT commit to git)
6. Extract credentials:
   ```json
   {
     "project_id": "FIREBASE_PROJECT_ID",
     "client_email": "FIREBASE_CLIENT_EMAIL",
     "private_key": "FIREBASE_PRIVATE_KEY"
   }
   ```

#### Resend API Key

1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Create new API key
3. Add your domain and verify it
4. Copy API key to `RESEND_API_KEY`

## Frontend Deployment (Firebase Hosting)

Firebase Hosting provides fast, secure hosting for your React app with CDN.

### Prerequisites

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login
```

### Initial Setup

1. **Initialize Firebase Hosting**

   ```bash
   firebase init hosting
   ```

   Configuration:

   - Public directory: `build`
   - Single-page app: `Yes`
   - GitHub integration: Optional
   - Overwrite index.html: `No`

2. **Update firebase.json**
   ```json
   {
     "hosting": {
       "public": "build",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ],
       "headers": [
         {
           "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
           "headers": [
             {
               "key": "Cache-Control",
               "value": "max-age=31536000"
             }
           ]
         },
         {
           "source": "**/*.@(js|css)",
           "headers": [
             {
               "key": "Cache-Control",
               "value": "max-age=31536000"
             }
           ]
         }
       ]
     }
   }
   ```

### Build and Deploy

```bash
# 1. Create production environment file
cp .env.production .env

# 2. Build for production
npm run build

# 3. Test locally (optional)
firebase serve

# 4. Deploy to Firebase
firebase deploy --only hosting

# 5. Get your hosting URL
# https://your-project-id.web.app
```

### Custom Domain

1. **Add Custom Domain**

   ```bash
   firebase hosting:channel:deploy live --only hosting
   ```

2. **Configure DNS**

   - Go to Firebase Console → Hosting
   - Click "Add custom domain"
   - Follow DNS configuration instructions
   - Wait for SSL certificate (automatic)

3. **Update CORS**
   - Update `FRONTEND_URL` in backend `.env`
   - Redeploy backend

## Backend Deployment

### Google Cloud Run (Recommended)

Best for Firebase integration, automatic scaling, and pay-per-use pricing.

#### Prerequisites

```bash
# Install Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# Login and set project
gcloud auth login
gcloud config set project your-prod-project-id
```

#### Setup

1. **Create Dockerfile** (backend/Dockerfile)

   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   # Copy package files
   COPY package*.json ./

   # Install dependencies (production only)
   RUN npm ci --only=production

   # Copy source code
   COPY . .

   # Expose port
   EXPOSE 8080

   # Health check
   HEALTHCHECK --interval=30s --timeout=3s \
     CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

   # Start server
   CMD ["node", "server.js"]
   ```

2. **Create .dockerignore**

   ```
   node_modules
   npm-debug.log
   .env
   .env.*
   logs
   *.log
   .git
   .gitignore
   README.md
   tests
   ```

3. **Build and Deploy**

   ```bash
   cd backend

   # Build container
   gcloud builds submit --tag gcr.io/your-prod-project-id/transaction-api

   # Deploy to Cloud Run
   gcloud run deploy transaction-api \
     --image gcr.io/your-prod-project-id/transaction-api \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 8080 \
     --set-env-vars "NODE_ENV=production,LOG_LEVEL=error,FRONTEND_URL=https://yourdomain.com" \
     --set-secrets "RESEND_API_KEY=RESEND_API_KEY:latest,FIREBASE_PRIVATE_KEY=FIREBASE_PRIVATE_KEY:latest"
   ```

4. **Set Environment Variables**

   ```bash
   # Using Secret Manager for sensitive data
   echo -n "your_resend_key" | gcloud secrets create RESEND_API_KEY --data-file=-
   echo -n "your_firebase_key" | gcloud secrets create FIREBASE_PRIVATE_KEY --data-file=-

   # Or set directly (not recommended for sensitive data)
   gcloud run services update transaction-api \
     --set-env-vars KEY=VALUE
   ```

5. **Get Service URL**

   ```bash
   gcloud run services describe transaction-api --format='value(status.url)'
   # https://transaction-api-xxxxx-uc.a.run.app
   ```

6. **Update Frontend**
   - Set `REACT_APP_API_URL` to Cloud Run URL
   - Redeploy frontend

#### Continuous Deployment

Create `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend to Cloud Run

on:
  push:
    branches: [main]
    paths: ["backend/**"]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}

      - name: Build and Deploy
        run: |
          cd backend
          gcloud builds submit --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/transaction-api
          gcloud run deploy transaction-api \
            --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/transaction-api \
            --platform managed \
            --region us-central1
```

---

### Railway

Simple deployment with automatic HTTPS and environment variables.

#### Setup

1. **Install Railway CLI**

   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Create Project**

   ```bash
   cd backend
   railway init
   ```

3. **Set Environment Variables**

   ```bash
   railway variables set NODE_ENV=production
   railway variables set PORT=5000
   railway variables set LOG_LEVEL=error
   railway variables set FRONTEND_URL=https://yourdomain.com
   railway variables set RESEND_API_KEY=your_key
   # ... etc
   ```

4. **Deploy**

   ```bash
   railway up
   ```

5. **Get URL**
   ```bash
   railway domain
   # https://transaction-api.railway.app
   ```

#### Automatic Deployment

Connect GitHub repository in Railway dashboard for automatic deployments.

---

### Render

Free tier available, automatic HTTPS, easy setup.

#### Setup

1. **Create Web Service**

   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect GitHub repository
   - Select `backend` as root directory

2. **Configure Service**

   - Name: `transaction-api`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Plan: Free or Starter

3. **Set Environment Variables**

   - Add all variables from backend/.env.production
   - Secrets are automatically encrypted

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Get URL: `https://transaction-api.onrender.com`

#### Auto Deploy

Enable "Auto-Deploy" in dashboard for automatic deployments on git push.

---

### Heroku

Mature platform with extensive add-ons.

#### Setup

1. **Install Heroku CLI**

   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create App**

   ```bash
   cd backend
   heroku create transaction-api
   ```

3. **Set Environment Variables**

   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set PORT=5000
   heroku config:set LOG_LEVEL=error
   # ... etc
   ```

4. **Create Procfile**

   ```
   web: node server.js
   ```

5. **Deploy**

   ```bash
   git push heroku main
   ```

6. **Scale**
   ```bash
   heroku ps:scale web=1
   ```

## Database Setup

### Firestore Security Rules

Deploy production security rules:

**firestore.rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
             request.auth.token.admin == true;
    }

    // Events - public read, admin write
    match /events/{eventId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Submissions - admin only
    match /submissions/{submissionId} {
      allow read: if isAdmin();
      allow create: if true;  // Public can submit
      allow update, delete: if isAdmin();
    }

    // Users - own data only
    match /users/{userId} {
      allow read, write: if isAuthenticated() &&
                           request.auth.uid == userId;
    }
  }
}
```

Deploy:

```bash
firebase deploy --only firestore:rules
```

### Storage Security Rules

**storage.rules**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Submissions - public upload, admin read/delete
    match /submissions/{submissionId}/{fileName} {
      allow create: if request.resource.size < 5 * 1024 * 1024 &&  // 5MB
                      request.resource.contentType == 'application/pdf';
      allow read, delete: if request.auth != null &&
                            request.auth.token.admin == true;
    }
  }
}
```

Deploy:

```bash
firebase deploy --only storage:rules
```

### Database Indexes

Create indexes for common queries:

**firestore.indexes.json**:

```json
{
  "indexes": [
    {
      "collectionGroup": "submissions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "eventId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [{ "fieldPath": "date", "order": "ASCENDING" }]
    }
  ]
}
```

Deploy:

```bash
firebase deploy --only firestore:indexes
```

## Post-Deployment

### Create Admin User

```bash
# SSH into backend or run locally with production env
node backend/scripts/createAdmin.js
```

### Verify Deployment

1. **Frontend Health Check**

   ```bash
   curl https://yourdomain.com
   # Should return React app HTML
   ```

2. **Backend Health Check**

   ```bash
   curl https://api.yourdomain.com/health
   # {"status":"ok"}
   ```

3. **API Test**

   ```bash
   curl https://api.yourdomain.com/api/events
   # Should return events array
   ```

4. **Rate Limiting Test**
   ```bash
   # Send 101 requests rapidly
   for i in {1..101}; do
     curl https://api.yourdomain.com/api/events
   done
   # Should get 429 after 100 requests
   ```

### SSL/TLS Verification

```bash
# Check SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### Performance Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test API performance (100 requests, 10 concurrent)
ab -n 100 -c 10 https://api.yourdomain.com/api/events
```

## Monitoring

### Logging

**Backend Logs**:

- **Cloud Run**: `gcloud logs read --service=transaction-api`
- **Railway**: `railway logs`
- **Render**: View in dashboard
- **Heroku**: `heroku logs --tail`

**Frontend Logs**:

- Check browser console for client-side errors
- Monitor Firebase Hosting logs in console

### Error Monitoring

#### Sentry Integration

1. **Install Sentry**

   ```bash
   # Frontend
   npm install @sentry/react

   # Backend
   cd backend && npm install @sentry/node
   ```

2. **Configure Frontend** (src/index.js)

   ```javascript
   import * as Sentry from "@sentry/react";

   if (process.env.NODE_ENV === "production") {
     Sentry.init({
       dsn: "your_sentry_dsn",
       environment: "production",
       tracesSampleRate: 0.1,
     });
   }
   ```

3. **Configure Backend** (backend/server.js)

   ```javascript
   const Sentry = require("@sentry/node");

   if (process.env.NODE_ENV === "production") {
     Sentry.init({
       dsn: process.env.SENTRY_DSN,
       environment: "production",
       tracesSampleRate: 0.1,
     });
   }
   ```

4. **Update Logger** (backend/src/utils/logger.js)
   ```javascript
   // In production, send errors to Sentry
   if (process.env.NODE_ENV === "production") {
     logger.on("error", (error) => {
       Sentry.captureException(error);
     });
   }
   ```

### Uptime Monitoring

#### UptimeRobot (Free)

1. Go to [UptimeRobot](https://uptimerobot.com)
2. Create monitors:
   - Frontend: https://yourdomain.com
   - Backend: https://api.yourdomain.com/health
3. Set alert contacts (email, Slack, etc.)

#### Pingdom

1. Go to [Pingdom](https://www.pingdom.com)
2. Create uptime checks
3. Configure alerting

### Performance Monitoring

#### Google Analytics

Add to frontend (src/index.html):

```html
<!-- Google Analytics -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "GA_MEASUREMENT_ID");
</script>
```

## Troubleshooting

### Common Issues

#### 1. CORS Errors

**Symptom**: `Access to fetch has been blocked by CORS policy`

**Solution**:

```bash
# Verify FRONTEND_URL in backend .env
echo $FRONTEND_URL

# Should match your frontend domain exactly
# Redeploy backend after fixing
```

#### 2. Authentication Failures

**Symptom**: `401 Unauthorized` for admin routes

**Solution**:

```bash
# Verify Firebase credentials
firebase projects:list

# Check service account key
cat backend/serviceAccountKey.json | jq '.project_id'

# Recreate admin user
node backend/scripts/createAdmin.js
```

#### 3. File Upload Failures

**Symptom**: Files not uploading or 404 on download

**Solution**:

```bash
# Check storage bucket
echo $FIREBASE_STORAGE_BUCKET

# Verify storage rules
firebase deploy --only storage:rules

# Check bucket permissions in Firebase Console
```

#### 4. Rate Limiting Too Strict

**Symptom**: Users getting 429 errors frequently

**Solution**:

```javascript
// backend/src/middlewares/rateLimiter.js
// Increase limits for production
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // Increased from 100
  // ...
});
```

#### 5. Slow Response Times

**Symptom**: API responses taking > 5 seconds

**Solution**:

```bash
# Check Firestore indexes
firebase deploy --only firestore:indexes

# Monitor Cloud Run scaling
gcloud run services describe transaction-api

# Consider caching with Redis
```

### Rollback

#### Frontend Rollback (Firebase)

```bash
# List deployments
firebase hosting:list

# Rollback to previous version
firebase hosting:rollback
```

#### Backend Rollback

**Cloud Run**:

```bash
# List revisions
gcloud run revisions list --service=transaction-api

# Rollback to specific revision
gcloud run services update-traffic transaction-api \
  --to-revisions=transaction-api-00005-abc=100
```

**Railway/Render**: Use dashboard to rollback to previous deployment

## Maintenance

### Regular Tasks

**Weekly**:

- Check error logs
- Monitor uptime
- Review rate limit hits

**Monthly**:

- Update dependencies (`npm update`)
- Review security advisories (`npm audit`)
- Check disk usage
- Verify backups

**Quarterly**:

- Performance audit
- Security audit
- Cost analysis

### Backup Strategy

**Firestore Exports**:

```bash
# Export entire database
gcloud firestore export gs://your-backup-bucket/$(date +%Y%m%d)

# Schedule with Cloud Scheduler
gcloud scheduler jobs create app-engine firestore-backup \
  --schedule="0 2 * * *" \
  --http-method=POST \
  --uri="https://firestore.googleapis.com/v1/projects/your-project/databases/(default):exportDocuments"
```

**Storage Backups**: Use Google Cloud Storage lifecycle rules

## Cost Optimization

### Firebase (Spark Plan - Free)

- **Hosting**: 10 GB/month storage, 360 MB/day transfer
- **Firestore**: 50K reads, 20K writes, 20K deletes/day
- **Storage**: 5 GB storage, 1 GB/day download
- **Authentication**: Unlimited

### Firebase (Blaze Plan - Pay as you go)

Estimate monthly costs:

- **Hosting**: ~$0.15/GB bandwidth
- **Firestore**: ~$0.06 per 100K reads
- **Storage**: ~$0.026/GB storage
- **Cloud Functions**: ~$0.40 per million invocations

### Backend Hosting

- **Cloud Run**: Free 2 million requests/month, then $0.40/million
- **Railway**: Free tier available, then $5-20/month
- **Render**: Free tier available (limited), then $7+/month
- **Heroku**: $7/month (Eco dyno)

## Support

For deployment issues:

- GitHub Issues: [Create an issue](https://github.com/KyryloKozlovskyi/transaction-website/issues)
- Email: g00425385@atu.ie

---

**Deployment Checklist**: ✅ Print this guide and check off items as you deploy!
