# Changelog

## [Unreleased] - 2026-01-01

### Fixed

- **Date Formatting**: Fixed date display issue in EventUpdate component where dates from MongoDB weren't properly formatted for HTML date inputs
- **Duplicate Routes**: Removed duplicate route definitions for updating and deleting events in server.js
- **Form Reset**: Fixed form reset bug in Submit.js that referenced non-existent `paid` field
- **File Upload**: Added 5MB file size limit and PDF-only validation to multer configuration

### Added

- **Environment Variables**: Created .env.example files for both frontend and backend
- **API URL Configuration**: All frontend components now use REACT_APP_API_URL environment variable
- **File Size Limits**: Added 5MB file size limit for PDF uploads
- **PDF Filter**: Added file type validation in multer middleware
- **Better Error Handling**: Email sending failures no longer break submission process
- **NPM Scripts**: Added `server` and `server:dev` scripts to package.json for running backend

### Security

- **Authentication**: Added auth middleware to previously unprotected endpoints:
  - PUT /api/events/:id
  - DELETE /api/events/:id
  - GET /api/submissions/:id/file
- **CORS**: Maintained CORS configuration (should be restricted for production)
- **.gitignore**: Added .env files to gitignore to prevent credential leaks
- **Environment Variables**: Created example files to guide secure configuration

### Removed

- Commented-out code blocks that were no longer needed
- Duplicate route definitions for event update and delete operations

### Changed

- Improved error handling in submission endpoint (email failures are now logged but don't block submissions)
- Consolidated event deletion logic to properly clean up associated submissions

### Security Notes

⚠️ **Important**: Please update the following before deploying:

1. Change the JWT_SECRET in backend/.env to a strong random value
2. Update MongoDB credentials if they're exposed
3. Update Resend API key
4. Change default admin password when creating admin user
5. Restrict CORS to specific origins in production

### Migration Guide

1. Copy `.env.example` to `.env` in project root
2. Copy `backend/.env.example` to `backend/.env`
3. Update backend/.env with your actual credentials
4. Ensure JWT_SECRET is a strong random string
5. Run `node backend/createAdmin.js` to create admin user with a secure password
