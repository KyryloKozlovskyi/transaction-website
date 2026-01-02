#!/bin/bash
# First, let's try to create an event without auth (should fail)
echo "Testing event creation without auth..."
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "courseName": "Test Course",
    "venue": "Test Venue",
    "date": "2026-02-01",
    "price": 100,
    "emailText": "Test email text"
  }' 2>&1
echo -e "\n"
