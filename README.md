# Transaction Website

A production-ready event management and submission platform with enterprise-level security, logging, and error handling.

**Version 3.0** - Comprehensive Refactoring Complete! 🎉

[![Security](https://img.shields.io/badge/security-helmet-blue)](https://helmetjs.github.io/)
[![Rate Limiting](https://img.shields.io/badge/rate%20limiting-enabled-green)](https://www.npmjs.com/package/express-rate-limit)
[![Logging](https://img.shields.io/badge/logging-winston-orange)](https://github.com/winstonjs/winston)
[![Validation](https://img.shields.io/badge/validation-joi-red)](https://joi.dev/)

## 🚀 Features

### Core Functionality

- **Event Management**: Create, update, and manage training courses and events
- **Submission System**: Allow users to submit applications with PDF uploads (5MB limit)
- **Admin Panel**: Secure admin interface with Firebase Authentication
- **Payment Tracking**: Track payment status for submissions
- **Email Notifications**: Automated confirmations via Resend

### Production-Ready Features (New in v3.0)

- **🔒 Enterprise Security**: Helmet security headers, CORS whitelisting, rate limiting
- **📊 Structured Logging**: Winston (backend) and custom logger (frontend) with log levels
- **🛡️ Error Handling**: Global error boundaries, async error handlers, graceful failures
- **✅ Input Validation**: Joi schemas for all API endpoints with field-level errors
- **🔄 Auto-Retry**: Exponential backoff for failed requests (network resilience)
- **📈 Centralized Constants**: Single source of truth for all configuration
- **🎯 Rate Limiting**: Multi-tier protection (API, Auth, Submissions, Admin)

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Security](#security)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

## ⚡ Quick Start

```bash
# Clone and install
git clone https://github.com/KyryloKozlovskyi/transaction-website.git
cd transaction-website
npm run install:all

# Configure environment (see Configuration section)
cp .env.example .env
cp backend/.env.example backend/.env

# Start development
npm start              # Frontend (port 3000)
npm run server:dev     # Backend (port 5000)
```

## 🏗️ Architecture

### Technology Stack

**Backend:**

- Node.js + Express 4.21
- Firebase Admin SDK (Auth, Firestore, Storage)
- Winston (Logging)
- Joi (Validation)
- Helmet (Security Headers)
- Express Rate Limit (DDoS Protection)
- Multer (File Uploads)
- Resend (Email Service)

**Frontend:**

- React 19.0
- React Router 7.1
- React Bootstrap 2.10
- Axios (HTTP Client with retry logic)
- Firebase SDK 12.7
- Error Boundaries
- Custom Logger

### Architecture Patterns

**Backend (MVC + Services):**

```
backend/
├── src/
│   ├── controllers/      # Business logic
│   ├── routes/           # API endpoints with validation
│   ├── middlewares/      # Auth, validation, rate limiting
│   ├── services/         # Email, storage services
│   ├── config/           # Constants, CORS, validation
│   └── utils/            # Logger, error handlers, Firestore helpers
```

**Frontend (Feature-Based):**

```
src/
├── features/             # Feature modules (auth, events, submissions, admin)
├── shared/               # Shared utilities, components, constants
│   ├── components/       # ErrorBoundary, NavigationBar, Footer
│   ├── utils/            # Logger, API client with retry
│   └── constants/        # Centralized constants
└── pages/                # Top-level pages
```

### Key Improvements (v3.0)

**Phase 1 - Critical Fixes:**

- ✅ Structured logging (Winston) replacing 40+ console statements
- ✅ Centralized constants (collections, statuses, messages)
- ✅ Async error handling (asyncHandler wrapper)
- ✅ Firestore helpers (DRY operations)
- ✅ Input validation (Joi schemas)
- ✅ Environment validation

**Phase 2 - Security & Validation:**

- ✅ Helmet security headers (CSP, XSS, Clickjacking protection)
- ✅ CORS whitelisting (environment-aware)
- ✅ Multi-tier rate limiting (API, Auth, Submissions, Admin)
- ✅ Payload size limits (10MB)

**Phase 3 - Frontend Improvements:**

- ✅ Frontend logger utility (environment-aware)
- ✅ Error Boundary component (graceful error handling)
- ✅ API retry logic (exponential backoff)
- ✅ Frontend constants (standardized messages)
- ✅ Enhanced error messages

## 🎯 Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Firebase Account**: [Create one here](https://console.firebase.google.com)
- **Resend Account**: [Sign up here](https://resend.com)
- **Git**: For version control

## 📦 Installation

### 1. Clone Repository

```bash
git clone https://github.com/KyryloKozlovskyi/transaction-website.git
cd transaction-website
```

### 2. Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Or install separately
npm install                    # Frontend
cd backend && npm install      # Backend
```

### 3. Configure Environment Variables

#### Frontend (`.env`)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Optional: Logging Configuration
REACT_APP_LOG_LEVEL=DEBUG  # DEBUG, INFO, WARN, ERROR, NONE
```

#### Backend (`backend/.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=development
LOG_LEVEL=info

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_DOMAIN=your_domain@resend.dev

# Firebase Admin Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key_here"
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app

# Admin Setup
ADMIN_EMAIL=admin@example.com
```

### 4. Firebase Setup

1. **Create Firebase Project**

   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Cloud Storage

2. **Download Service Account Key**

   ```bash
   # Save as backend/serviceAccountKey.json
   # Get from: Project Settings > Service Accounts > Generate New Private Key
   ```

3. **Configure Security Rules**

   ```bash
   # Deploy Firestore and Storage rules
   firebase deploy --only firestore:rules,storage
   ```

4. **Create Admin User**
   ```bash
   cd backend
   node scripts/createAdmin.js
   ```

## 💻 Development

### Start Development Servers

```bash
# Terminal 1 - Frontend (http://localhost:3000)
npm start

# Terminal 2 - Backend (http://localhost:5000)
npm run server:dev
```

### Available Scripts

#### Frontend Scripts

```bash
npm start              # Start development server
npm test               # Run tests in watch mode
npm test:ci            # Run tests with coverage
npm run build          # Build for production
npm run lint           # Check code quality
npm run lint:fix       # Auto-fix linting issues
```

#### Backend Scripts

```bash
npm start              # Start production server
npm run dev            # Start with nodemon (auto-reload)
npm test               # Run tests with coverage
npm run lint           # Check code quality
npm run lint:fix       # Auto-fix linting issues
```

#### Combined Scripts

```bash
npm run install:all    # Install all dependencies
npm run server         # Start backend (production)
npm run server:dev     # Start backend (development)
```

## 🔒 Security

### Security Features

**1. Helmet Security Headers**

- Content Security Policy (CSP)
- XSS Protection
- Clickjacking Prevention
- MIME Type Sniffing Prevention
- Strict Transport Security (HSTS)

**2. CORS Protection**

- Environment-aware whitelisting
- Blocks unauthorized origins in production
- Logs all CORS violations

**3. Rate Limiting**

- **General API**: 100 requests / 15 minutes per IP
- **Authentication**: 5 requests / 15 minutes per IP
- **Submissions**: 10 requests / hour per IP
- **Admin Operations**: 50 requests / 15 minutes per IP

**4. Input Validation**

- Joi schemas for all endpoints
- Field-level error messages
- Type checking and format validation
- File size limits (5MB for PDFs)

**5. Authentication**

- Firebase Authentication
- JWT token verification
- Admin role-based access control
- Automatic token refresh

### Security Best Practices

```bash
# Never commit these files:
backend/.env
backend/serviceAccountKey.json
src/process.env

# Check .gitignore before committing
git status --ignored
```

## 📚 API Documentation

### Base URL

- Development: `http://localhost:5000`
- Production: `https://your-domain.com`

### Authentication

All protected routes require Bearer token:

```
Authorization: Bearer <firebase_id_token>
```

### Rate Limits

| Endpoint Type    | Limit | Window |
| ---------------- | ----- | ------ |
| General API      | 100   | 15 min |
| Authentication   | 5     | 15 min |
| Submissions      | 10    | 1 hour |
| Admin Operations | 50    | 15 min |

### Endpoints

#### Events

**GET `/api/events`**

- **Description**: Get all events
- **Auth**: Not required
- **Rate Limit**: General (100/15min)
- **Response**: `200 OK`

```json
[
  {
    "id": "event_id",
    "courseName": "Course Name",
    "venue": "Venue Location",
    "date": "2026-01-15T00:00:00.000Z",
    "price": 100,
    "emailText": "Custom email content",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

**GET `/api/events/:id`**

- **Description**: Get event by ID
- **Auth**: Not required
- **Rate Limit**: General (100/15min)
- **Response**: `200 OK`, `404 Not Found`

**POST `/api/events`**

- **Description**: Create new event
- **Auth**: Required (Admin only)
- **Rate Limit**: Admin (50/15min)
- **Body**:

```json
{
  "courseName": "string (required, max 100)",
  "venue": "string (required, max 200)",
  "date": "string (ISO date, required)",
  "price": "number (required, min 0)",
  "emailText": "string (required, max 1000)"
}
```

- **Response**: `201 Created`, `400 Bad Request`, `401 Unauthorized`, `429 Too Many Requests`

**PUT `/api/events/:id`**

- **Description**: Update event
- **Auth**: Required (Admin only)
- **Rate Limit**: Admin (50/15min)
- **Response**: `204 No Content`, `400 Bad Request`, `404 Not Found`

**DELETE `/api/events/:id`**

- **Description**: Delete event and associated submissions
- **Auth**: Required (Admin only)
- **Rate Limit**: Admin (50/15min)
- **Response**: `204 No Content`, `404 Not Found`

#### Submissions

**POST `/api/submissions`**

- **Description**: Submit application
- **Auth**: Not required
- **Rate Limit**: Submission (10/hour)
- **Content-Type**: `multipart/form-data`
- **Body**:

```
eventId: string (required)
type: "person" | "company" (required)
name: string (required, max 100)
email: string (required, valid email)
file: PDF file (optional, max 5MB)
```

- **Response**: `201 Created`, `400 Bad Request`, `429 Too Many Requests`

**GET `/api/submissions`**

- **Description**: Get all submissions
- **Auth**: Required (Admin only)
- **Rate Limit**: Admin (50/15min)
- **Response**: `200 OK`

**PATCH `/api/submissions/:id`**

- **Description**: Update submission (payment status)
- **Auth**: Required (Admin only)
- **Rate Limit**: Admin (50/15min)
- **Body**: `{ "paid": boolean }`
- **Response**: `200 OK`, `404 Not Found`

**GET `/api/submissions/:id/file`**

- **Description**: Download submission file
- **Auth**: Required (Admin only)
- **Rate Limit**: Admin (50/15min)
- **Response**: `302 Redirect`, `404 Not Found`

#### Authentication

**GET `/api/auth/verify`**

- **Description**: Verify Firebase token
- **Auth**: Required
- **Rate Limit**: Auth (5/15min)
- **Response**: `200 OK`, `401 Unauthorized`

### Error Responses

All errors follow this format:

```json
{
  "message": "Error description"
}
```

Common status codes:

- `400`: Bad Request (validation failed)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (not admin)
- `404`: Not Found
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## 🚀 Deployment

### Production Environment Variables

#### Frontend

```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_LOG_LEVEL=ERROR
# ... Firebase config
```

#### Backend

```env
NODE_ENV=production
PORT=5000
LOG_LEVEL=error
FRONTEND_URL=https://yourdomain.com
# ... other config
```

### Build for Production

```bash
# Frontend
npm run build

# Backend (no build needed, runs directly)
cd backend && npm start
```

### Deploy to Firebase Hosting

```bash
# Build frontend
npm run build

# Deploy to Firebase
firebase deploy --only hosting

# Deploy Firestore rules and Storage rules
firebase deploy --only firestore:rules,storage
```

### Deploy Backend

Backend can be deployed to:

- **Google Cloud Run** (recommended for Firebase integration)
- **Railway**
- **Render**
- **Heroku**
- **AWS EC2**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guides.

## 📊 Monitoring

### Logging

**Backend Logs:**

- Location: `backend/logs/` (production)
- Levels: `error`, `warn`, `info`, `debug`
- Rotation: 5MB per file
- Files: `error.log`, `combined.log`

**Frontend Logs:**

- Storage: `sessionStorage` (last 10 errors)
- Key: `app_errors`
- View in DevTools: `Application > Session Storage`

### Log Levels

```env
# Development
LOG_LEVEL=debug          # Backend
REACT_APP_LOG_LEVEL=DEBUG  # Frontend

# Production
LOG_LEVEL=error          # Backend
REACT_APP_LOG_LEVEL=ERROR  # Frontend
```

### Monitoring Integration

Ready for integration with:

- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Datadog**: APM and logging
- **New Relic**: Performance monitoring

## 🐛 Troubleshooting

### Common Issues

**1. Rate Limit Exceeded**

```
Error: Too many requests, please try again later.
```

Solution: Wait for the rate limit window to reset or increase limits in `backend/src/middlewares/rateLimiter.js`

**2. CORS Error**

```
Error: Access to fetch has been blocked by CORS policy
```

Solution: Add frontend URL to `FRONTEND_URL` in `backend/.env`

**3. Firebase Auth Error**

```
Error: Firebase: Error (auth/invalid-api-key)
```

Solution: Check Firebase configuration in `.env` and ensure API key is correct

**4. File Upload Failed**

```
Error: Only PDF files are allowed
```

Solution: Ensure file is PDF format and under 5MB

**5. Admin Access Denied**

```
Error: Access denied. Admin only.
```

Solution: Run `node backend/scripts/createAdmin.js` to grant admin privileges

### Debug Mode

Enable debug logging:

```bash
# Backend
LOG_LEVEL=debug npm run dev

# Frontend
REACT_APP_LOG_LEVEL=DEBUG npm start
```

## 📖 Documentation

- [ARCHITECTURE_ANALYSIS.md](./ARCHITECTURE_ANALYSIS.md) - Detailed architecture analysis
- [PHASE1_REFACTORING_COMPLETE.md](./PHASE1_REFACTORING_COMPLETE.md) - Phase 1 improvements
- [PHASE2_REFACTORING_COMPLETE.md](./PHASE2_REFACTORING_COMPLETE.md) - Phase 2 security enhancements
- [API.md](./API.md) - Complete API reference (coming soon)
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide (coming soon)
- [SECURITY.md](./SECURITY.md) - Security documentation (coming soon)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Style

- **Backend**: ESLint with Airbnb base config
- **Frontend**: ESLint with React config
- Run `npm run lint:fix` before committing

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Kyrylo Kozlovskyi** - [GitHub](https://github.com/KyryloKozlovskyi)

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Resend for email service
- React Bootstrap for UI components
- Winston for logging
- Joi for validation
- Helmet for security

## 📞 Support

For issues and questions:

- GitHub Issues: [Create an issue](https://github.com/KyryloKozlovskyi/transaction-website/issues)
- Email: g00425385@atu.ie

---

**Built with ❤️ using modern best practices and production-ready patterns.**
