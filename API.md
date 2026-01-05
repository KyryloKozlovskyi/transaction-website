# API Documentation

Complete reference for the Transaction Website REST API.

**Base URL (Development)**: `http://localhost:5000`

**Version**: 3.0.0

## Table of Contents

- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Events API](#events-api)
- [Submissions API](#submissions-api)
- [Authentication API](#authentication-api)
- [Code Examples](#code-examples)

## Authentication

Most endpoints require Firebase ID tokens for authentication.

### Getting a Token

```javascript
// Frontend (Firebase SDK)
import { getAuth } from "firebase/auth";

const auth = getAuth();
const user = auth.currentUser;
const token = await user.getIdToken();
```

### Using the Token

```http
GET /api/events HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Refresh

Tokens expire after 1 hour. The frontend automatically refreshes them:

```javascript
// Handled by src/shared/utils/api.js
// Interceptor automatically adds fresh token to requests
```

## Rate Limiting

The API implements multi-tier rate limiting to prevent abuse:

### Rate Limit Tiers

| Tier                 | Limit        | Window     | Applies To                |
| -------------------- | ------------ | ---------- | ------------------------- |
| **General API**      | 100 requests | 15 minutes | All public endpoints      |
| **Authentication**   | 5 requests   | 15 minutes | `/api/auth/*`             |
| **Submissions**      | 10 requests  | 1 hour     | `POST /api/submissions`   |
| **Admin Operations** | 50 requests  | 15 minutes | Protected admin endpoints |

### Rate Limit Headers

```http
HTTP/1.1 200 OK
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: 1704067200
```

### Rate Limit Exceeded Response

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "message": "Too many requests, please try again later."
}
```

## Error Handling

### Error Response Format

All errors follow this consistent format:

```json
{
  "message": "Human-readable error description"
}
```

### HTTP Status Codes

| Code | Meaning               | Description                              |
| ---- | --------------------- | ---------------------------------------- |
| 200  | OK                    | Request succeeded                        |
| 201  | Created               | Resource created successfully            |
| 204  | No Content            | Request succeeded, no content returned   |
| 400  | Bad Request           | Invalid input (validation failed)        |
| 401  | Unauthorized          | Missing or invalid authentication token  |
| 403  | Forbidden             | Valid token but insufficient permissions |
| 404  | Not Found             | Resource doesn't exist                   |
| 429  | Too Many Requests     | Rate limit exceeded                      |
| 500  | Internal Server Error | Server-side error                        |

### Validation Errors

When validation fails (400), the response includes field-level details:

```json
{
  "message": "\"courseName\" is required"
}
```

## Events API

### List All Events

Get all available events.

```http
GET /api/events
```

**Authentication**: Not required  
**Rate Limit**: General (100/15min)

**Response**: `200 OK`

```json
[
  {
    "id": "abc123",
    "courseName": "Manual Handling Training",
    "venue": "Main Training Center, Dublin",
    "date": "2026-02-15T10:00:00.000Z",
    "price": 150,
    "emailText": "Thank you for registering for Manual Handling Training...",
    "createdAt": "2026-01-01T12:00:00.000Z"
  },
  {
    "id": "def456",
    "courseName": "First Aid Training",
    "venue": "Safety Center, Cork",
    "date": "2026-03-20T09:00:00.000Z",
    "price": 200,
    "emailText": "Thank you for registering for First Aid Training...",
    "createdAt": "2026-01-05T14:30:00.000Z"
  }
]
```

**curl Example**:

```bash
curl http://localhost:5000/api/events
```

---

### Get Event by ID

Get a specific event by its ID.

```http
GET /api/events/:id
```

**Authentication**: Not required  
**Rate Limit**: General (100/15min)

**Parameters**:

- `id` (path) - Event ID

**Response**: `200 OK`

```json
{
  "id": "abc123",
  "courseName": "Manual Handling Training",
  "venue": "Main Training Center, Dublin",
  "date": "2026-02-15T10:00:00.000Z",
  "price": 150,
  "emailText": "Thank you for registering for Manual Handling Training...",
  "createdAt": "2026-01-01T12:00:00.000Z"
}
```

**Errors**:

- `404 Not Found` - Event doesn't exist

```json
{
  "message": "Event not found"
}
```

**curl Example**:

```bash
curl http://localhost:5000/api/events/abc123
```

---

### Create Event

Create a new event (admin only).

```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json
```

**Authentication**: Required (Admin)  
**Rate Limit**: Admin (50/15min)

**Request Body**:

```json
{
  "courseName": "Manual Handling Training",
  "venue": "Main Training Center, Dublin",
  "date": "2026-02-15T10:00:00.000Z",
  "price": 150,
  "emailText": "Thank you for registering for Manual Handling Training. We look forward to seeing you on February 15th."
}
```

**Validation Rules**:

- `courseName`: string, required, max 100 characters
- `venue`: string, required, max 200 characters
- `date`: ISO 8601 date string, required
- `price`: number, required, min 0
- `emailText`: string, required, max 1000 characters

**Response**: `201 Created`

```json
{
  "id": "abc123",
  "courseName": "Manual Handling Training",
  "venue": "Main Training Center, Dublin",
  "date": "2026-02-15T10:00:00.000Z",
  "price": 150,
  "emailText": "Thank you for registering for Manual Handling Training...",
  "createdAt": "2026-01-01T12:00:00.000Z"
}
```

**Errors**:

- `400 Bad Request` - Validation failed
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin

**curl Example**:

```bash
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseName": "Manual Handling Training",
    "venue": "Main Training Center, Dublin",
    "date": "2026-02-15T10:00:00.000Z",
    "price": 150,
    "emailText": "Thank you for registering..."
  }'
```

---

### Update Event

Update an existing event (admin only).

```http
PUT /api/events/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Authentication**: Required (Admin)  
**Rate Limit**: Admin (50/15min)

**Parameters**:

- `id` (path) - Event ID

**Request Body**: Same as Create Event

**Response**: `204 No Content`

**Errors**:

- `400 Bad Request` - Validation failed
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin
- `404 Not Found` - Event doesn't exist

**curl Example**:

```bash
curl -X PUT http://localhost:5000/api/events/abc123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseName": "Updated Manual Handling Training",
    "venue": "New Training Center",
    "date": "2026-02-20T10:00:00.000Z",
    "price": 175,
    "emailText": "Updated confirmation email..."
  }'
```

---

### Delete Event

Delete an event and all associated submissions (admin only).

```http
DELETE /api/events/:id
Authorization: Bearer <token>
```

**Authentication**: Required (Admin)  
**Rate Limit**: Admin (50/15min)

**Parameters**:

- `id` (path) - Event ID

**Response**: `204 No Content`

**Errors**:

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin
- `404 Not Found` - Event doesn't exist

**Note**: This operation also deletes:

- All submissions for this event
- All associated PDF files from storage

**curl Example**:

```bash
curl -X DELETE http://localhost:5000/api/events/abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Submissions API

### Create Submission

Submit an application for an event.

```http
POST /api/submissions
Content-Type: multipart/form-data
```

**Authentication**: Not required  
**Rate Limit**: Submission (10/hour)

**Form Data**:

- `eventId`: string (required) - ID of the event
- `type`: string (required) - Either "person" or "company"
- `name`: string (required, max 100 chars) - Applicant name or company name
- `email`: string (required, valid email) - Contact email
- `file`: file (optional, PDF only, max 5MB) - Supporting document

**Response**: `201 Created`

```json
{
  "id": "sub789",
  "eventId": "abc123",
  "type": "person",
  "name": "John Doe",
  "email": "john@example.com",
  "fileName": "resume.pdf",
  "paid": false,
  "createdAt": "2026-01-10T15:30:00.000Z"
}
```

**Errors**:

- `400 Bad Request` - Validation failed or invalid file
- `404 Not Found` - Event doesn't exist
- `429 Too Many Requests` - Submission rate limit exceeded

**Validation Errors**:

```json
// Missing required field
{
  "message": "\"eventId\" is required"
}

// Invalid email
{
  "message": "\"email\" must be a valid email"
}

// Invalid type
{
  "message": "\"type\" must be one of [person, company]"
}

// File too large
{
  "message": "File size cannot exceed 5MB"
}

// Invalid file type
{
  "message": "Only PDF files are allowed"
}
```

**curl Example**:

```bash
curl -X POST http://localhost:5000/api/submissions \
  -F "eventId=abc123" \
  -F "type=person" \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "file=@./resume.pdf"
```

**JavaScript Example**:

```javascript
const formData = new FormData();
formData.append("eventId", "abc123");
formData.append("type", "person");
formData.append("name", "John Doe");
formData.append("email", "john@example.com");
formData.append("file", fileInput.files[0]);

const response = await fetch("http://localhost:5000/api/submissions", {
  method: "POST",
  body: formData,
});
```

---

### List All Submissions

Get all submissions across all events (admin only).

```http
GET /api/submissions
Authorization: Bearer <token>
```

**Authentication**: Required (Admin)  
**Rate Limit**: Admin (50/15min)

**Response**: `200 OK`

```json
[
  {
    "id": "sub789",
    "eventId": "abc123",
    "eventName": "Manual Handling Training",
    "type": "person",
    "name": "John Doe",
    "email": "john@example.com",
    "fileName": "resume.pdf",
    "paid": false,
    "createdAt": "2026-01-10T15:30:00.000Z"
  },
  {
    "id": "sub790",
    "eventId": "def456",
    "eventName": "First Aid Training",
    "type": "company",
    "name": "ABC Corp",
    "email": "contact@abc.com",
    "fileName": "company_form.pdf",
    "paid": true,
    "createdAt": "2026-01-11T09:15:00.000Z"
  }
]
```

**Errors**:

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin

**curl Example**:

```bash
curl http://localhost:5000/api/submissions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Update Submission

Update submission details (payment status) - admin only.

```http
PATCH /api/submissions/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Authentication**: Required (Admin)  
**Rate Limit**: Admin (50/15min)

**Parameters**:

- `id` (path) - Submission ID

**Request Body**:

```json
{
  "paid": true
}
```

**Validation Rules**:

- `paid`: boolean, required

**Response**: `200 OK`

```json
{
  "id": "sub789",
  "eventId": "abc123",
  "type": "person",
  "name": "John Doe",
  "email": "john@example.com",
  "fileName": "resume.pdf",
  "paid": true,
  "createdAt": "2026-01-10T15:30:00.000Z"
}
```

**Errors**:

- `400 Bad Request` - Invalid paid value
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin
- `404 Not Found` - Submission doesn't exist

**curl Example**:

```bash
curl -X PATCH http://localhost:5000/api/submissions/sub789 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paid": true}'
```

---

### Download Submission File

Get a download URL for a submission's PDF file (admin only).

```http
GET /api/submissions/:id/file
Authorization: Bearer <token>
```

**Authentication**: Required (Admin)  
**Rate Limit**: Admin (50/15min)

**Parameters**:

- `id` (path) - Submission ID

**Response**: `302 Found` (redirects to signed download URL)

**Errors**:

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin
- `404 Not Found` - Submission or file doesn't exist

```json
{
  "message": "No file associated with this submission"
}
```

**curl Example**:

```bash
# Follow redirect to download file
curl -L http://localhost:5000/api/submissions/sub789/file \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o downloaded_file.pdf
```

**Notes**:

- URL is valid for 1 hour
- Direct download, no JSON response
- File served from Firebase Cloud Storage

---

## Authentication API

### Verify Token

Verify that a Firebase ID token is valid.

```http
GET /api/auth/verify
Authorization: Bearer <token>
```

**Authentication**: Required  
**Rate Limit**: Auth (5/15min)

**Response**: `200 OK`

```json
{
  "message": "Token is valid",
  "uid": "firebase_user_id",
  "email": "user@example.com",
  "isAdmin": false
}
```

**Errors**:

- `401 Unauthorized` - Token is invalid, expired, or missing

```json
{
  "message": "Invalid or expired token"
}
```

**curl Example**:

```bash
curl http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Code Examples

### JavaScript (Axios)

```javascript
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

// Create API instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await getFirebaseToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      console.error("Rate limit exceeded");
    }
    return Promise.reject(error);
  }
);

// Example: Get all events
const getEvents = async () => {
  const response = await api.get("/api/events");
  return response.data;
};

// Example: Create event (admin)
const createEvent = async (eventData) => {
  const response = await api.post("/api/events", eventData);
  return response.data;
};

// Example: Submit application
const submitApplication = async (formData) => {
  const response = await api.post("/api/submissions", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
```

### Python (requests)

```python
import requests

API_BASE_URL = 'http://localhost:5000'

# Get all events
def get_events():
    response = requests.get(f'{API_BASE_URL}/api/events')
    response.raise_for_status()
    return response.json()

# Create event (admin)
def create_event(token, event_data):
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.post(
        f'{API_BASE_URL}/api/events',
        json=event_data,
        headers=headers
    )
    response.raise_for_status()
    return response.json()

# Submit application
def submit_application(event_id, name, email, file_path=None):
    data = {
        'eventId': event_id,
        'type': 'person',
        'name': name,
        'email': email
    }

    files = {}
    if file_path:
        files['file'] = open(file_path, 'rb')

    response = requests.post(
        f'{API_BASE_URL}/api/submissions',
        data=data,
        files=files
    )
    response.raise_for_status()
    return response.json()

# Handle rate limiting
from time import sleep
from requests.exceptions import HTTPError

def make_request_with_retry(func, max_retries=3):
    for attempt in range(max_retries):
        try:
            return func()
        except HTTPError as e:
            if e.response.status_code == 429:
                wait_time = 2 ** attempt  # Exponential backoff
                print(f'Rate limited. Waiting {wait_time}s...')
                sleep(wait_time)
            else:
                raise
    raise Exception('Max retries exceeded')
```

### Postman Collection

Import this collection into Postman:

```json
{
  "info": {
    "name": "Transaction Website API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000"
    },
    {
      "key": "token",
      "value": "YOUR_FIREBASE_TOKEN"
    }
  ],
  "item": [
    {
      "name": "Events",
      "item": [
        {
          "name": "Get All Events",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/events"
          }
        },
        {
          "name": "Create Event",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/events",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"courseName\": \"Test Course\",\n  \"venue\": \"Test Venue\",\n  \"date\": \"2026-01-01T00:00:00.000Z\",\n  \"price\": 100,\n  \"emailText\": \"Test email\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        }
      ]
    }
  ]
}
```

## Rate Limit Handling

### Best Practices

1. **Implement Exponential Backoff**

```javascript
async function requestWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.response?.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}
```

2. **Check Rate Limit Headers**

```javascript
const response = await fetch("/api/events");
const remaining = response.headers.get("RateLimit-Remaining");
const reset = response.headers.get("RateLimit-Reset");

if (remaining < 10) {
  console.warn(`Only ${remaining} requests remaining`);
}
```

3. **Cache Responses**

```javascript
const cache = new Map();

async function getEventsWithCache() {
  if (cache.has("events")) {
    const cached = cache.get("events");
    if (Date.now() - cached.timestamp < 60000) {
      // 1 minute
      return cached.data;
    }
  }

  const data = await api.get("/api/events");
  cache.set("events", { data, timestamp: Date.now() });
  return data;
}
```

## Webhook Events (Future Feature)

Planned webhook support for:

- Submission created
- Payment status changed
- Event updated
- Event deleted

## Changelog

### v3.0.0 (2026-01-XX)

- Added multi-tier rate limiting
- Added input validation with Joi
- Added structured error responses
- Enhanced security headers
- Added admin-only endpoints

### v2.0.0 (2025-XX-XX)

- Initial API with events and submissions
- Firebase authentication
- File upload support

## Support

For API issues:

- GitHub Issues: [Create an issue](https://github.com/KyryloKozlovskyi/transaction-website/issues)
- Email: g00425385@atu.ie
