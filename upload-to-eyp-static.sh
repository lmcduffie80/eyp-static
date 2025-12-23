#!/bin/bash

# Upload to S3 Bucket: eyp-static (with eyp-static/ subdirectory)
# Usage: ./upload-to-eyp-static.sh

BUCKET_NAME="eyp-static"
BUCKET_PATH="s3://${BUCKET_NAME}/eyp-static/"

echo "=========================================="
echo "Uploading files to: ${BUCKET_PATH}"
echo "=========================================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed."
    echo ""
    echo "Install it:"
    echo "  macOS: curl \"https://awscli.amazonaws.com/AWSCLIV2.pkg\" -o \"/tmp/AWSCLIV2.pkg\" && sudo installer -pkg /tmp/AWSCLIV2.pkg -target /"
    echo "  Or download from: https://aws.amazon.com/cli/"
    echo ""
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured."
    echo ""
    echo "Run: aws configure"
    echo ""
    exit 1
fi

# Check if bucket exists
if ! aws s3 ls "s3://${BUCKET_NAME}" &> /dev/null; then
    echo "❌ Bucket '${BUCKET_NAME}' not found."
    echo "Please create the bucket first in AWS Console."
    exit 1
fi

echo "✅ Bucket found: ${BUCKET_NAME}"
echo "📁 Upload path: ${BUCKET_PATH}"
echo ""

# Show what will be uploaded (dry run)
echo "Preview of files to upload (dry run):"
echo "--------------------------------------"
aws s3 sync . "${BUCKET_PATH}" \
    --exclude "*.git/*" \
    --exclude ".git/*" \
    --exclude "*.md" \
    --exclude "node_modules/*" \
    --exclude "*.sh" \
    --exclude ".DS_Store" \
    --exclude "Icon*" \
    --exclude "aws-config-example.js" \
    --exclude "s3-bucket-policy.json" \
    --exclude "lambda-functions/*" \
    --exclude "AWS_SETUP_GUIDE.md" \
    --exclude "S3_DEPLOYMENT_INSTRUCTIONS.md" \
    --exclude "QUICK_START_S3.md" \
    --exclude "files-to-upload.txt" \
    --exclude "DEPLOY_TO_eyp-static.md" \
    --exclude "upload-to-s3.sh" \
    --exclude "upload-to-eyp-static.sh" \
    --dryrun 2>&1 | head -30

echo ""
echo "--------------------------------------"
read -p "Continue with upload? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Uploading files..."
    echo ""
    
    aws s3 sync . "${BUCKET_PATH}" \
        --exclude "*.git/*" \
        --exclude ".git/*" \
        --exclude "*.md" \
        --exclude "node_modules/*" \
        --exclude "*.sh" \
        --exclude ".DS_Store" \
        --exclude "Icon*" \
        --exclude "aws-config-example.js" \
        --exclude "s3-bucket-policy.json" \
        --exclude "lambda-functions/*" \
        --exclude "AWS_SETUP_GUIDE.md" \
        --exclude "S3_DEPLOYMENT_INSTRUCTIONS.md" \
        --exclude "QUICK_START_S3.md" \
        --exclude "files-to-upload.txt" \
        --exclude "DEPLOY_TO_eyp-static.md" \
        --exclude "upload-to-s3.sh" \
        --exclude "upload-to-eyp-static.sh" \
        --delete
    
    echo ""
    echo "✅ Upload complete!"
    echo ""
    echo "Files uploaded to: ${BUCKET_PATH}"
    echo ""
    echo "Note: If you're using static website hosting, you may need to:"
    echo "1. Set index document path to: eyp-static/index.html"
    echo "2. Or configure your CloudFront/domain to point to the eyp-static/ subdirectory"
    echo ""
else
    echo "Upload cancelled."
fi

