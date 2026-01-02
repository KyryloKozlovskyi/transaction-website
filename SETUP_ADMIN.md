# Admin Setup Guide

## Current Issue

When you try to create events or submit records, nothing happens because:

1. You need to be logged in as an admin user
2. The admin user needs to be created in Firebase Authentication first

## Setup Steps

### Step 1: Create Admin User in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **transaction-website**
3. Go to **Authentication** → **Users** tab
4. Click **Add User**
5. Enter:
   - **Email**: Your admin email (e.g., `admin@yourdomain.com`)
   - **Password**: A secure password
6. Click **Add User**
7. **Important**: Note down this email and password!

### Step 2: Grant Admin Privileges

After creating the user in Firebase Console:

```bash
# 1. Update the admin email in backend/.env
cd backend
nano .env  # or use your preferred editor

# 2. Change this line:
ADMIN_EMAIL=your-actual-admin-email@domain.com

# 3. Run the admin setup script:
node createAdmin.js
```

### Step 3: Log In to Your Application

1. Make sure both servers are running:

   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start

   # Terminal 2 - Frontend
   npm start
   ```

2. Open your browser: http://localhost:3000

3. Go to Login page: http://localhost:3000/login

4. Enter the email and password you created in Step 1

5. If successful, you'll be redirected to the Admin Panel

### Step 4: Create Your First Event

1. From the Admin Panel, click **"Create Event"**
2. Fill in the form:
   - **Course Name**: e.g., "Introduction to Web Development"
   - **Venue**: e.g., "Online" or "Main Building, Room 101"
   - **Date**: Select a future date
   - **Price**: Enter the price (e.g., 100)
   - **Email Text**: Confirmation email text
3. Click **"Create Event"**
4. You should be redirected to the Admin Panel

### Step 5: Test Submissions

1. Go to http://localhost:3000/submit
2. Now you should see the event you created in the dropdown
3. Fill in the form and submit

## Troubleshooting

### "Nothing happens when I click Create Event"

**Open Browser Console** (F12 or Right-click → Inspect → Console tab)

Look for error messages:

1. **"No Firebase user logged in"**

   - Solution: Go to /login and log in first

2. **"Error 401: No token provided"**

   - Solution: Make sure you're logged in with the admin account

3. **"Error 403: Access denied. Admin only"**

   - Solution: Run `node backend/createAdmin.js` to grant admin privileges

4. **Network errors**
   - Solution: Make sure backend is running on port 5000
   - Check: `curl http://localhost:5000/health`

### Check if Backend is Running

```bash
curl http://localhost:5000/health
# Should return: {"status":"ok","service":"transaction-website-api"}
```

### Check if Admin User Has Privileges

```bash
cd backend
node -e "
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json'))
});
admin.auth().getUserByEmail('YOUR_EMAIL@domain.com')
  .then(user => admin.auth().getUser(user.uid))
  .then(user => console.log('Admin claim:', user.customClaims))
  .then(() => process.exit(0));
"
```

### Verify Events Exist

```bash
curl http://localhost:5000/api/events
# Should return: [...] array of events (or [] if none created yet)
```

## Quick Test Sequence

```bash
# 1. Check backend
curl http://localhost:5000/health

# 2. Check events
curl http://localhost:5000/api/events

# 3. Check frontend
curl http://localhost:3000
```

All three should return responses. If any fail, that service isn't running.

## Current Configuration

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000
- **Firebase Project**: transaction-website
- **Admin Email (to update)**: admin@example.com

## Next Steps After Setup

1. Log in at http://localhost:3000/login
2. Create events from Admin Panel
3. Test submissions from public Submit page
4. View/manage submissions from Admin Panel → View Submissions
