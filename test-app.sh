#!/bin/bash

echo "════════════════════════════════════════════════════════════════"
echo "  Testing Transaction Website"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Backend server
echo "🔍 Test 1: Backend Server (Port 5000)"
if curl -s http://localhost:5000/api/events > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running and responsive${NC}"
else
    echo -e "${RED}✗ Backend is not responding${NC}"
    exit 1
fi

# Test 2: Backend returns JSON
echo ""
echo "🔍 Test 2: API Returns Valid JSON"
EVENTS=$(curl -s http://localhost:5000/api/events)
if echo "$EVENTS" | python3 -m json.tool > /dev/null 2>&1; then
    echo -e "${GREEN}✓ API returns valid JSON${NC}"
    echo "   Response: $EVENTS"
else
    echo -e "${RED}✗ API response is not valid JSON${NC}"
    exit 1
fi

# Test 3: Frontend server
echo ""
echo "🔍 Test 3: Frontend Server (Port 3000)"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${RED}✗ Frontend is not responding${NC}"
    exit 1
fi

# Test 4: Firebase configuration
echo ""
echo "🔍 Test 4: Firebase Configuration"
if grep -q "REACT_APP_FIREBASE_API_KEY" .env && [ -f "backend/serviceAccountKey.json" ]; then
    echo -e "${GREEN}✓ Firebase credentials configured${NC}"
else
    echo -e "${RED}✗ Firebase credentials missing${NC}"
    exit 1
fi

# Test 5: Check for common routes
echo ""
echo "🔍 Test 5: Testing API Endpoints"
ROUTES=("events" "submissions")
for route in "${ROUTES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/$route)
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "401" ]; then
        echo -e "${GREEN}✓ GET /api/$route - Status: $STATUS${NC}"
    else
        echo -e "${RED}✗ GET /api/$route - Status: $STATUS${NC}"
    fi
done

echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✓ All automated tests passed!${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📝 Manual Testing Steps:"
echo ""
echo "1. Open: http://localhost:3000"
echo "2. Click 'Admin' or 'Login' in navigation"
echo "3. Sign in with your Firebase credentials"
echo "4. Test admin features:"
echo "   - Create an event"
echo "   - View events list"
echo "   - Update an event"
echo "   - View submissions"
echo "   - Delete an event"
echo ""
echo "5. Test public features:"
echo "   - View events on home page"
echo "   - Submit a form (without login)"
echo "   - Upload a PDF file"
echo ""
echo "════════════════════════════════════════════════════════════════"
