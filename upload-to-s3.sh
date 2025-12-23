#!/bin/bash

# Quick S3 Upload Script
# Usage: ./upload-to-s3.sh [bucket-name]

BUCKET_NAME=${1:-"eyp-static-website"}

echo "=========================================="
echo "Uploading files to S3: $BUCKET_NAME"
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
    echo "⚠️  Bucket '$BUCKET_NAME' not found."
    echo ""
    read -p "Create bucket? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Creating bucket..."
        aws s3 mb "s3://${BUCKET_NAME}" --region us-east-1
        
        echo "Enabling static website hosting..."
        aws s3 website "s3://${BUCKET_NAME}" \
            --index-document index.html \
            --error-document index.html
        
        echo "Setting bucket policy..."
        if [ -f "s3-bucket-policy.json" ]; then
            # Update bucket name in policy
            sed "s/eyp-static-website/${BUCKET_NAME}/g" s3-bucket-policy.json > /tmp/bucket-policy.json
            aws s3api put-bucket-policy \
                --bucket "${BUCKET_NAME}" \
                --policy file:///tmp/bucket-policy.json
            rm /tmp/bucket-policy.json
        fi
        
        echo "Configuring public access..."
        aws s3api put-public-access-block \
            --bucket "${BUCKET_NAME}" \
            --public-access-block-configuration \
            "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
        
        echo "✅ Bucket created and configured!"
    else
        echo "Exiting. Please create the bucket first or use an existing bucket name."
        exit 1
    fi
fi

echo "Uploading files..."
echo ""

aws s3 sync . "s3://${BUCKET_NAME}" \
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
    --delete \
    --dryrun

echo ""
read -p "Continue with upload? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    aws s3 sync . "s3://${BUCKET_NAME}" \
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
        --delete
    
    echo ""
    echo "✅ Upload complete!"
    echo ""
    echo "Your website URL:"
    echo "http://${BUCKET_NAME}.s3-website-us-east-1.amazonaws.com"
    echo ""
else
    echo "Upload cancelled."
fi
