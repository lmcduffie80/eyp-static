#!/bin/bash

# AWS S3 Deployment Script for EYP Static Website
# This script helps you deploy your static site to AWS S3

# Configuration
BUCKET_NAME="eyp-static-website"
REGION="us-east-1"
PROFILE="default"  # Change to your AWS profile if needed

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}EYP Static Website - AWS S3 Deployment${NC}"
echo "=========================================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed.${NC}"
    echo "Install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if bucket exists
echo -e "${YELLOW}Checking if bucket exists...${NC}"
if aws s3 ls "s3://${BUCKET_NAME}" 2>&1 | grep -q 'NoSuchBucket'; then
    echo -e "${YELLOW}Bucket does not exist. Creating bucket...${NC}"
    aws s3 mb "s3://${BUCKET_NAME}" --region "${REGION}"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Bucket created successfully!${NC}"
        
        # Enable static website hosting
        echo -e "${YELLOW}Enabling static website hosting...${NC}"
        aws s3 website "s3://${BUCKET_NAME}" \
            --index-document index.html \
            --error-document index.html
        
        # Set bucket policy for public read access
        if [ -f "s3-bucket-policy.json" ]; then
            echo -e "${YELLOW}Setting bucket policy...${NC}"
            # Update the policy JSON with actual bucket name
            sed "s/eyp-static-website/${BUCKET_NAME}/g" s3-bucket-policy.json > /tmp/bucket-policy.json
            aws s3api put-bucket-policy \
                --bucket "${BUCKET_NAME}" \
                --policy file:///tmp/bucket-policy.json
            rm /tmp/bucket-policy.json
        else
            echo -e "${YELLOW}Warning: s3-bucket-policy.json not found. You'll need to set bucket policy manually.${NC}"
        fi
        
        # Disable block public access (needed for static hosting)
        echo -e "${YELLOW}Configuring public access...${NC}"
        aws s3api put-public-access-block \
            --bucket "${BUCKET_NAME}" \
            --public-access-block-configuration \
            "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
    else
        echo -e "${RED}Failed to create bucket. Please check your AWS credentials.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}Bucket exists.${NC}"
fi

# Sync files to S3
echo -e "${YELLOW}Uploading files to S3...${NC}"
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
    --delete \
    --region "${REGION}"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}Deployment successful!${NC}"
    echo ""
    echo "Your website is available at:"
    echo -e "${GREEN}http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com${NC}"
    echo ""
    echo "To use a custom domain:"
    echo "1. Create a CloudFront distribution pointing to this bucket"
    echo "2. Configure your DNS to point to the CloudFront distribution"
    echo "3. Enable HTTPS with an SSL certificate (ACM)"
else
    echo -e "${RED}Deployment failed. Please check the error messages above.${NC}"
    exit 1
fi

