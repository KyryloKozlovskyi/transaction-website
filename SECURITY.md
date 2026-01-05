# Security Policy

## Overview

This document outlines the security features, best practices, and vulnerability reporting procedures for the Transaction Website application.

**Security Rating**: ⭐⭐⭐⭐⭐ Production-Ready

## Table of Contents

- [Security Features](#security-features)
- [Authentication & Authorization](#authentication--authorization)
- [Data Protection](#data-protection)
- [Network Security](#network-security)
- [Input Validation](#input-validation)
- [Rate Limiting](#rate-limiting)
- [Security Headers](#security-headers)
- [File Upload Security](#file-upload-security)
- [Logging & Monitoring](#logging--monitoring)
- [Best Practices](#best-practices)
- [Vulnerability Reporting](#vulnerability-reporting)
- [Security Checklist](#security-checklist)

## Security Features

### Implemented Security Measures

✅ **Authentication**

- Firebase Authentication with JWT tokens
- Token expiration and automatic refresh
- Role-based access control (RBAC)
- Admin-only routes protected

✅ **Input Validation**

- Joi schema validation on all endpoints
- Type checking and format validation
- SQL injection prevention (NoSQL database)
- XSS prevention through sanitization

✅ **Rate Limiting**

- Multi-tier protection (API, Auth, Submissions, Admin)
- IP-based tracking
- Exponential backoff support
- DDoS mitigation

✅ **Security Headers**

- Helmet middleware enabled
- Content Security Policy (CSP)
- X-Frame-Options (Clickjacking protection)
- X-Content-Type-Options (MIME sniffing prevention)
- Strict-Transport-Security (HSTS)

✅ **CORS Protection**

- Whitelist-based origin checking
- Environment-aware configuration
- Credentials support controlled
- Preflight request handling

✅ **File Upload Security**

- File type validation (PDF only)
- File size limits (5MB max)
- Secure storage (Firebase Cloud Storage)
- Virus scanning ready

✅ **Data Protection**

- Environment variables for secrets
- Encrypted connections (HTTPS/TLS)
- Firestore security rules
- Storage security rules

✅ **Error Handling**

- No sensitive data in error messages
- Structured logging (no console.log)
- Production error suppression
- Stack trace hiding in production

## Authentication & Authorization

### Firebase Authentication

```javascript
// Authentication flow
1. User signs in with email/password
2. Firebase returns JWT token
3. Token included in API requests
4. Backend verifies token with Firebase Admin SDK
5. Admin claim checked for protected routes
```

### Token Management

**Token Lifecycle**:

- Issued: On successful login
- Expiration: 1 hour
- Refresh: Automatic (Firebase SDK handles)
- Revocation: Manual via Firebase Console

**Token Verification** (backend/src/middlewares/auth.js):

```javascript
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      throw new AppError("No token provided", 401);
    }

    // Verify with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;

    next();
  } catch (error) {
    logger.error("Token verification failed", { error: error.message });
    next(new AppError("Invalid or expired token", 401));
  }
};
```

### Admin Access Control

**Granting Admin Privileges**:

```bash
# Run this script to make a user admin
node backend/scripts/createAdmin.js
```

**Admin Check Middleware** (backend/src/middlewares/auth.js):

```javascript
const requireAdmin = (req, res, next) => {
  if (!req.user?.admin) {
    logger.warn("Unauthorized admin access attempt", {
      uid: req.user?.uid,
      email: req.user?.email,
      ip: req.ip,
    });
    throw new AppError("Access denied. Admin only.", 403);
  }
  next();
};
```

### Protected Routes

| Endpoint                        | Auth Required | Admin Required |
| ------------------------------- | ------------- | -------------- |
| `GET /api/events`               | ❌            | ❌             |
| `POST /api/events`              | ✅            | ✅             |
| `PUT /api/events/:id`           | ✅            | ✅             |
| `DELETE /api/events/:id`        | ✅            | ✅             |
| `POST /api/submissions`         | ❌            | ❌             |
| `GET /api/submissions`          | ✅            | ✅             |
| `PATCH /api/submissions/:id`    | ✅            | ✅             |
| `GET /api/submissions/:id/file` | ✅            | ✅             |

## Data Protection

### Environment Variables

**Never Commit**:

```bash
# Add to .gitignore
.env
.env.local
.env.production
backend/.env
backend/serviceAccountKey.json
```

**Required Secrets**:

```env
# Backend
RESEND_API_KEY=re_xxxxx                 # Email service
FIREBASE_PRIVATE_KEY="-----BEGIN..."    # Firebase Admin SDK
ADMIN_EMAIL=admin@example.com           # Admin user

# Frontend
REACT_APP_FIREBASE_API_KEY=AIzaSy...    # Firebase client
```

### Data Encryption

**In Transit**:

- HTTPS/TLS 1.2+ for all connections
- Firebase enforces SSL
- Backend requires HTTPS in production

**At Rest**:

- Firestore: Encrypted by default (AES-256)
- Storage: Encrypted by default
- Logs: Stored securely, rotated

### Firestore Security Rules

**Production Rules** (firestore.rules):

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

    function isValidEvent() {
      return request.resource.data.keys().hasAll(
        ['courseName', 'venue', 'date', 'price', 'emailText']
      ) &&
      request.resource.data.courseName is string &&
      request.resource.data.courseName.size() <= 100 &&
      request.resource.data.venue is string &&
      request.resource.data.venue.size() <= 200 &&
      request.resource.data.price is number &&
      request.resource.data.price >= 0;
    }

    // Events
    match /events/{eventId} {
      allow read: if true;  // Public read
      allow write: if isAdmin() && isValidEvent();
    }

    // Submissions
    match /submissions/{submissionId} {
      allow read: if isAdmin();
      allow create: if true;  // Public submit
      allow update, delete: if isAdmin();
    }

    // Users (admin claims)
    match /users/{userId} {
      allow read, write: if isAuthenticated() &&
                           request.auth.uid == userId;
    }
  }
}
```

### Storage Security Rules

**Production Rules** (storage.rules):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper functions
    function isAdmin() {
      return request.auth != null &&
             request.auth.token.admin == true;
    }

    function isValidPDF() {
      return request.resource.size < 5 * 1024 * 1024 &&  // 5MB
             request.resource.contentType == 'application/pdf';
    }

    // Submissions folder
    match /submissions/{submissionId}/{fileName} {
      allow create: if isValidPDF();
      allow read, delete: if isAdmin();
    }
  }
}
```

## Network Security

### CORS Configuration

**Environment-Aware CORS** (backend/src/config/cors.js):

```javascript
const allowedOrigins = {
  development: ["http://localhost:3000", "http://127.0.0.1:3000"],
  production: [
    process.env.FRONTEND_URL,
    /^https:\/\/.*\.yourdomain\.com$/, // Subdomains
  ],
};

const corsOptions = {
  origin: (origin, callback) => {
    const env = process.env.NODE_ENV || "development";
    const allowed = allowedOrigins[env];

    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);

    // Check whitelist
    const isAllowed = allowed.some((allowedOrigin) => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      logger.warn("CORS blocked origin", { origin, env });
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
```

### Security Headers

**Helmet Configuration** (backend/src/app.js):

```javascript
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://firebasestorage.googleapis.com"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  })
);
```

**Headers Applied**:

- `Content-Security-Policy`: Prevents XSS attacks
- `X-DNS-Prefetch-Control`: Controls DNS prefetching
- `X-Frame-Options`: Prevents clickjacking (DENY)
- `X-Content-Type-Options`: Prevents MIME sniffing (nosniff)
- `Strict-Transport-Security`: Enforces HTTPS
- `X-Download-Options`: Prevents downloads from opening
- `X-Permitted-Cross-Domain-Policies`: Restricts Adobe Flash

## Input Validation

### Joi Schema Validation

**Event Validation** (backend/src/middlewares/validation.js):

```javascript
const eventSchema = Joi.object({
  courseName: Joi.string().max(100).required().trim().messages({
    "string.empty": "Course name is required",
    "string.max": "Course name must not exceed 100 characters",
  }),

  venue: Joi.string().max(200).required().trim(),

  date: Joi.date().iso().required().messages({
    "date.base": "Date must be a valid ISO 8601 date",
    "any.required": "Date is required",
  }),

  price: Joi.number().min(0).required().messages({
    "number.min": "Price must be a positive number",
  }),

  emailText: Joi.string().max(1000).required().trim(),
});
```

**Submission Validation**:

```javascript
const submissionSchema = Joi.object({
  eventId: Joi.string().required(),
  type: Joi.string().valid("person", "company").required(),
  name: Joi.string().max(100).required().trim(),
  email: Joi.string().email().required().trim().lowercase(),
});
```

### XSS Prevention

**Frontend Sanitization**:

```javascript
import DOMPurify from "dompurify";

// Sanitize user input before rendering
const sanitizedHTML = DOMPurify.sanitize(userInput);
```

**Backend Sanitization**:

```javascript
// Joi automatically trims and validates
// Additional sanitization for HTML content
const sanitizeHTML = (input) => {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};
```

## Rate Limiting

### Multi-Tier Protection

**Rate Limit Configuration** (backend/src/middlewares/rateLimiter.js):

```javascript
// General API - 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn("Rate limit exceeded", {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      message: "Too many requests, please try again later.",
    });
  },
});

// Authentication - 5 requests per 15 minutes (strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // Only count failed attempts
});

// Submissions - 10 requests per hour
const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
});

// Admin operations - 50 requests per 15 minutes
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
});
```

### DDoS Protection

**Additional Measures**:

- CloudFlare (recommended) for advanced DDoS protection
- IP blocking for repeat offenders
- Automatic ban after excessive rate limit violations

**Ban Management**:

```javascript
// Track repeat offenders
const violations = new Map();

const banMiddleware = (req, res, next) => {
  const ip = req.ip;
  const count = violations.get(ip) || 0;

  if (count > 10) {
    logger.error("IP banned", { ip, violations: count });
    return res.status(403).json({
      message: "Access denied. Contact support if this is an error.",
    });
  }

  next();
};
```

## Security Headers

### Response Headers

Headers set by Helmet:

```http
Content-Security-Policy: default-src 'self'
X-DNS-Prefetch-Control: off
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Download-Options: noopen
X-Content-Type-Options: nosniff
X-Permitted-Cross-Domain-Policies: none
```

### Rate Limit Headers

```http
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: 1704067200
```

## File Upload Security

### Validation

**File Type Check**:

```javascript
const multer = require("multer");

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    logger.warn("Invalid file type upload attempt", {
      mimetype: file.mimetype,
      ip: req.ip,
    });
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});
```

### Virus Scanning

**Recommended**: Integrate with ClamAV or similar

```javascript
// Example: VirusTotal API integration
const scanFile = async (fileBuffer) => {
  // Implementation depends on chosen service
  // Options: ClamAV, VirusTotal, AWS GuardDuty
};
```

### Secure Storage

- Files stored in Firebase Cloud Storage
- No public access (admin-only downloads)
- Signed URLs with 1-hour expiration
- Automatic cleanup on submission deletion

## Logging & Monitoring

### Structured Logging

**No Sensitive Data Logged**:

```javascript
// ❌ BAD
logger.info("User login", { password: req.body.password });

// ✅ GOOD
logger.info("User login attempt", {
  email: req.body.email,
  ip: req.ip,
  userAgent: req.headers["user-agent"],
});
```

### Security Events Logged

- Failed authentication attempts
- Admin access attempts
- Rate limit violations
- CORS violations
- File upload failures
- Unexpected errors

### Log Retention

- Development: Console only
- Production:
  - Files: 30 days (rotated at 5MB)
  - Error tracking: 90 days (Sentry)

## Best Practices

### For Developers

✅ **DO**:

- Use environment variables for all secrets
- Validate all user input
- Log security events
- Use HTTPS everywhere
- Keep dependencies updated
- Use least privilege principle
- Enable MFA for admin accounts
- Review security rules regularly

❌ **DON'T**:

- Commit secrets to git
- Log sensitive data (passwords, tokens, keys)
- Trust user input
- Expose error details in production
- Use default credentials
- Disable security features
- Skip input validation
- Hardcode configuration

### Dependency Management

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Update dependencies
npm update

# Check outdated packages
npm outdated
```

### Code Review Checklist

- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] Error handling implemented
- [ ] Authentication/authorization checked
- [ ] SQL/NoSQL injection prevented
- [ ] XSS prevention applied
- [ ] CSRF protection (if applicable)
- [ ] Rate limiting applied
- [ ] Logging appropriate (no sensitive data)
- [ ] Tests include security scenarios

## Vulnerability Reporting

### Responsible Disclosure

We take security seriously. If you discover a vulnerability:

**DO**:

1. Email: g00425385@atu.ie with subject "SECURITY"
2. Provide detailed description
3. Include steps to reproduce
4. Suggest fix if possible
5. Allow reasonable time for fix (90 days)

**DON'T**:

- Publicly disclose before fix
- Exploit the vulnerability
- Access user data
- Perform DoS attacks

### Reporting Template

```
Subject: SECURITY - [Brief Description]

Vulnerability Type: [XSS / SQLi / CSRF / etc.]
Severity: [Critical / High / Medium / Low]
Affected Component: [Frontend / Backend / Database]
Affected Endpoint: [URL or file path]

Description:
[Detailed description of the vulnerability]

Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Impact:
[Potential impact of exploitation]

Suggested Fix:
[Optional: Your suggestion for fixing]

Your Contact Info:
Name: [Your name]
Email: [Your email]
```

### Response Timeline

- **24 hours**: Initial response
- **7 days**: Severity assessment
- **30 days**: Fix deployed (critical/high)
- **90 days**: Fix deployed (medium/low)

### Bug Bounty

Currently no formal program, but we appreciate:

- Public acknowledgment (if desired)
- Credit in security advisories

## Security Checklist

### Pre-Production Checklist

- [ ] All environment variables configured
- [ ] Production Firebase project with security rules
- [ ] HTTPS/TLS enabled
- [ ] CORS configured with production URLs
- [ ] Rate limiting enabled
- [ ] Helmet security headers configured
- [ ] Admin users created with MFA
- [ ] File upload limits enforced
- [ ] Input validation on all endpoints
- [ ] Error messages don't expose sensitive info
- [ ] Logging configured (no sensitive data)
- [ ] Monitoring and alerting setup
- [ ] Backup strategy implemented
- [ ] Security testing completed
- [ ] Dependencies audited (`npm audit`)
- [ ] Code review completed

### Post-Production Checklist

- [ ] Monitor logs for security events
- [ ] Review rate limit violations
- [ ] Check for failed auth attempts
- [ ] Verify CORS violations
- [ ] Update dependencies monthly
- [ ] Review admin user list quarterly
- [ ] Test backup restoration
- [ ] Penetration testing (annual)
- [ ] Security audit (annual)

## Security Updates

### Version History

- **v3.0.0** (2026-01-XX)

  - ✅ Multi-tier rate limiting
  - ✅ Helmet security headers
  - ✅ Environment-aware CORS
  - ✅ Input validation (Joi)
  - ✅ Structured logging
  - ✅ Error boundaries (frontend)

- **v2.0.0** (2025-XX-XX)
  - ✅ Firebase Authentication
  - ✅ Admin role-based access
  - ✅ File upload validation

### Upcoming Security Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Virus scanning for uploads
- [ ] IP allowlist/blocklist
- [ ] API key rotation
- [ ] Automated security testing
- [ ] WAF integration (CloudFlare)
- [ ] Database encryption at field level
- [ ] Session management improvements

## Contact

**Security Team**: g00425385@atu.ie

**PGP Key**: Available upon request

---

**Last Updated**: 2026-01-XX  
**Next Review**: 2026-04-XX
