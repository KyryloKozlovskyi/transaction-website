# Firebase Migration Complete! 🎉

## What Changed

The application has been fully migrated from MongoDB to Firebase:

- **Authentication**: Custom JWT → Firebase Authentication
- **Database**: MongoDB → Cloud Firestore
- **File Storage**: MongoDB Buffer → Firebase Storage
- **Admin Management**: Manual user creation → Firebase custom claims

## 🚀 Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard

### 2. Enable Firebase Services

**Authentication:**

1. Go to Authentication → Get Started
2. Enable "Email/Password" sign-in method
3. Create your first admin user (note the email)

**Firestore Database:**

1. Go to Firestore Database → Create database
2. Start in "production mode"
3. Choose a location close to your users

**Storage:**

1. Go to Storage → Get Started
2. Start in "production mode"
3. Update rules to allow authenticated writes

### 3. Get Firebase Configuration

**For Frontend (.env):**

1. Go to Project Settings → General
2. Scroll to "Your apps" → Web app
3. Copy the config values to `.env`:
   ```
   REACT_APP_FIREBASE_API_KEY=...
   REACT_APP_FIREBASE_AUTH_DOMAIN=...
   REACT_APP_FIREBASE_PROJECT_ID=...
   REACT_APP_FIREBASE_STORAGE_BUCKET=...
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
   REACT_APP_FIREBASE_APP_ID=...
   ```

**For Backend (backend/.env):**

1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Copy values to `backend/.env`:
   ```
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@...
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   ADMIN_EMAIL=your_admin_email@example.com
   ```

### 4. Set Up Admin User

```bash
# Create a user in Firebase Console first
# Then grant admin privileges:
cd backend
node createAdmin.js
```

### 5. Update Firestore Security Rules

In Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read for events
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // Submissions require authentication for read, anyone can create
    match /submissions/{submissionId} {
      allow read, update, delete: if request.auth != null && request.auth.token.admin == true;
      allow create: if true;
    }
  }
}
```

### 6. Update Storage Security Rules

In Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /submissions/{fileName} {
      allow read: if request.auth != null && request.auth.token.admin == true;
      allow write: if true;
    }
  }
}
```

### 7. Install Dependencies

```bash
# Root (frontend)
npm install

# Backend
cd backend
npm install
```

### 8. Run the Application

```bash
# Terminal 1 - Backend
npm run server:dev

# Terminal 2 - Frontend
npm start
```

## 📋 API Changes

All API endpoints remain the same, but authentication now uses Firebase tokens:

- Frontend automatically includes Firebase ID token in requests
- Backend verifies token and checks admin claims
- No more JWT secrets or password hashing needed

## 🗂️ Data Structure

**Events Collection:**

```javascript
{
  courseName: string,
  venue: string,
  date: timestamp,
  price: number,
  emailText: string,
  createdAt: timestamp
}
```

**Submissions Collection:**

```javascript
{
  eventId: string,
  type: "person" | "company",
  name: string,
  email: string,
  fileUrl: string | null,
  fileName: string | null,
  paid: boolean,
  createdAt: timestamp
}
```

## 🔒 Security Improvements

1. **Better Authentication**: Firebase Auth handles all security
2. **Custom Claims**: Admin role managed by Firebase
3. **Secure File Storage**: Files stored in Firebase Storage, not database
4. **Automatic Token Refresh**: Firebase SDK handles token renewal
5. **No Password Hashing**: Firebase manages passwords securely

## 🎯 Benefits

- ✅ No MongoDB connection issues
- ✅ Real-time database updates
- ✅ Automatic scaling
- ✅ Built-in security
- ✅ Easy file management
- ✅ Simplified authentication
- ✅ Better developer experience

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Queries](https://firebase.google.com/docs/firestore/query-data/queries)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Firebase Storage](https://firebase.google.com/docs/storage)

## 🐛 Troubleshooting

**"Access denied. Admin privileges required"**

- Run `node backend/createAdmin.js` after creating user in Firebase Console
- Make sure you're signing in with the correct email

**"Firebase: Error (auth/user-not-found)"**

- Create the user in Firebase Console → Authentication first

**"Storage bucket not found"**

- Enable Firebase Storage in Firebase Console
- Verify FIREBASE_STORAGE_BUCKET in backend/.env

**CORS errors**

- Make sure both frontend and backend are running
- Check REACT_APP_API_URL in .env

## 📞 Support

For issues or questions:

1. Check Firebase Console for error logs
2. Check browser console for frontend errors
3. Check server console for backend errors
4. Verify all environment variables are set correctly
