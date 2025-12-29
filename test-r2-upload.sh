#!/bin/bash

# Test R2 Upload locally

echo "🧪 Testing R2 Upload Configuration..."
echo ""

# Check environment variables
echo "📋 Checking Environment Variables:"
echo "R2_ENDPOINT: ${R2_ENDPOINT:0:30}..."
echo "R2_BUCKET: $R2_BUCKET"
echo "R2_REGION: $R2_REGION"
echo "R2_ACCESS_KEY_ID: ${R2_ACCESS_KEY_ID:0:10}..."
echo "R2_SECRET_ACCESS_KEY: ${R2_SECRET_ACCESS_KEY:0:10}..."
echo ""

# Test presign-upload endpoint
echo "🔗 Testing Presign Upload URL Generation:"
curl -X POST http://localhost:5000/api/r2/presign-upload \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test-file.pdf",
    "contentType": "application/pdf"
  }' \
  -w "\n%{http_code}\n"

echo ""
echo "✅ Test complete! Check the presigned URL above."
