#!/bin/bash

# HoneyBook API Deployment Check Script
# This script helps verify if the API endpoint is deployed and accessible

echo "========================================="
echo "HoneyBook API Deployment Check"
echo "========================================="
echo ""

# Default URL (update this to your Vercel deployment URL)
VERCEL_URL="${1:-https://eyp-static-git-main-lee-mcduffies-projects.vercel.app}"
API_URL="${VERCEL_URL}/api/honeybook-sync"

echo "Checking API endpoint: ${API_URL}"
echo ""

# Check if file exists locally
echo "1. Checking local files..."
if [ -f "api/honeybook-sync.js" ]; then
    echo "   ✓ api/honeybook-sync.js exists locally"
    FILE_SIZE=$(wc -l < api/honeybook-sync.js)
    echo "   ✓ File size: ${FILE_SIZE} lines"
else
    echo "   ✗ api/honeybook-sync.js NOT FOUND locally"
    exit 1
fi

echo ""
echo "2. Checking Git status..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo "   ✓ Git repository detected"
    
    # Check if file is tracked
    if git ls-files --error-unmatch api/honeybook-sync.js > /dev/null 2>&1; then
        echo "   ✓ File is tracked in Git"
    else
        echo "   ⚠ File exists but is not tracked in Git"
    fi
    
    # Check last commit
    LAST_COMMIT=$(git log -1 --pretty=format:"%h - %s" -- api/honeybook-sync.js 2>/dev/null)
    if [ ! -z "$LAST_COMMIT" ]; then
        echo "   ✓ Last commit: $LAST_COMMIT"
    else
        echo "   ⚠ File has not been committed yet"
    fi
else
    echo "   ⚠ Not a Git repository"
fi

echo ""
echo "3. Testing API endpoint (GET request)..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}" 2>/dev/null)

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✓ API is LIVE! (HTTP $HTTP_CODE)"
    echo ""
    echo "   Response:"
    curl -s "${API_URL}" | python3 -m json.tool 2>/dev/null || curl -s "${API_URL}"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ✗ API endpoint NOT FOUND (HTTP 404)"
    echo "   → Function may not be deployed to Vercel"
    echo "   → Check Vercel Dashboard → Functions tab"
elif [ "$HTTP_CODE" = "000" ]; then
    echo "   ✗ Cannot connect to endpoint"
    echo "   → Check if URL is correct: ${API_URL}"
    echo "   → Verify Vercel deployment is active"
else
    echo "   ⚠ API returned HTTP $HTTP_CODE"
    echo "   → Check Vercel function logs for errors"
fi

echo ""
echo "4. Testing API endpoint (POST request)..."
POST_RESPONSE=$(curl -s -X POST "${API_URL}" \
    -H "Content-Type: application/json" \
    -d '{"projects": [], "manual_sync": true}' \
    -w "\nHTTP_CODE:%{http_code}")

POST_HTTP_CODE=$(echo "$POST_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
POST_BODY=$(echo "$POST_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$POST_HTTP_CODE" = "200" ]; then
    echo "   ✓ POST request successful (HTTP $POST_HTTP_CODE)"
    echo ""
    echo "   Response:"
    echo "$POST_BODY" | python3 -m json.tool 2>/dev/null || echo "$POST_BODY"
else
    echo "   ⚠ POST request returned HTTP $POST_HTTP_CODE"
    echo "   Response: $POST_BODY"
fi

echo ""
echo "========================================="
echo "Summary"
echo "========================================="
echo ""
echo "If all checks pass:"
echo "  → API is deployed and working!"
echo "  → You can proceed with Zapier setup"
echo ""
echo "If checks fail:"
echo "  → Check Vercel Dashboard → Functions tab"
echo "  → Verify deployment completed successfully"
echo "  → Check Vercel function logs for errors"
echo "  → Ensure code is pushed to GitHub (if using Git integration)"
echo ""
echo "Next steps:"
echo "  1. Visit: ${VERCEL_URL}/test-api.html (for interactive testing)"
echo "  2. Visit: ${API_URL} (to see API response)"
echo "  3. Check DEPLOYMENT_CHECK.md for detailed guide"
echo ""

