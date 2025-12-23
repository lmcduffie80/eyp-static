# AWS Setup Guide for EYP Static Site

This guide explains how to migrate your static site to AWS and set up backend services for the DJ Portal.

## Overview

### Current Setup
- **Static hosting**: Vercel (or similar)
- **Data storage**: localStorage (client-side only)
- **Authentication**: localStorage tokens

### AWS Architecture Options

## Option 1: Static Hosting Only (S3 + CloudFront)

Host your HTML/CSS/JS files on AWS without backend changes.

### Steps:
1. **Create S3 Bucket**
   - Go to AWS S3 Console
   - Create bucket: `eyp-static-website` (or your preferred name)
   - Enable static website hosting
   - Set index document: `index.html`
   - Set error document: `index.html` (for SPA routing)

2. **Upload Files**
   ```bash
   # Install AWS CLI
   aws s3 sync . s3://eyp-static-website --exclude "*.git/*" --exclude "node_modules/*"
   ```

3. **Set Bucket Permissions**
   - Make bucket public (for static hosting)
   - Add bucket policy for public read access

4. **Optional: Add CloudFront CDN**
   - Create CloudFront distribution
   - Point to S3 bucket
   - Enable HTTPS
   - Use custom domain (optional)

### Cost: ~$0.50-2/month for low traffic

---

## Option 2: Full AWS Backend (Recommended)

Use AWS services for authentication, data storage, and API endpoints.

### Architecture:
- **Static Files**: S3 + CloudFront
- **Authentication**: AWS Cognito
- **Database**: DynamoDB
- **API**: AWS Lambda + API Gateway
- **File Storage**: S3 (for user uploads)

### Step-by-Step Setup

#### 1. Set Up AWS Cognito for Authentication

**Purpose**: Replace localStorage authentication with secure server-side auth

```bash
# Create Cognito User Pool via AWS Console or CLI
aws cognito-idp create-user-pool \
  --pool-name eyp-dj-users \
  --policies PasswordPolicy={MinimumLength=8} \
  --auto-verified-attributes email
```

**Benefits**:
- Secure password hashing
- Email verification
- Password reset
- MFA support
- Token-based authentication

#### 2. Set Up DynamoDB Tables

**Tables needed**:
- `eyp-dj-users`: User information
- `eyp-dj-bookings`: Booking data
- `eyp-dj-reviews`: Reviews
- `eyp-dj-blocked-dates`: Blocked dates

```javascript
// Example DynamoDB table structure
{
  TableName: 'eyp-dj-users',
  KeySchema: [
    { AttributeName: 'username', KeyType: 'HASH' }
  ],
  AttributeDefinitions: [
    { AttributeName: 'username', AttributeType: 'S' }
  ],
  BillingMode: 'PAY_PER_REQUEST'
}
```

#### 3. Create Lambda Functions

**Functions needed**:
- `dj-login`: Handle authentication
- `dj-get-bookings`: Fetch bookings for a DJ
- `dj-save-booking`: Save/update booking
- `dj-get-blocked-dates`: Get blocked dates
- `dj-block-date`: Block a date
- `dj-get-reviews`: Get reviews
- `dj-update-profile`: Update user profile

**Example Lambda Function (dj-login)**:
```javascript
// index.js
const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
    const { username, password } = JSON.parse(event.body);
    
    try {
        const params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: process.env.COGNITO_CLIENT_ID,
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password
            }
        };
        
        const result = await cognito.initiateAuth(params).promise();
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                token: result.AuthenticationResult.IdToken,
                refreshToken: result.AuthenticationResult.RefreshToken
            })
        };
    } catch (error) {
        return {
            statusCode: 401,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                message: 'Invalid credentials'
            })
        };
    }
};
```

#### 4. Set Up API Gateway

- Create REST API
- Create resources: `/api/dj-login`, `/api/dj-bookings`, etc.
- Connect to Lambda functions
- Enable CORS
- Deploy to stage (e.g., `prod`)

**API Endpoints**:
```
POST /api/dj-login
GET /api/dj-bookings
POST /api/dj-bookings
GET /api/dj-blocked-dates
POST /api/dj-block-date
DELETE /api/dj-block-date/:date
GET /api/dj-reviews
PUT /api/dj-profile
```

#### 5. Update Frontend Code

**Update API calls in dj-login.html and dj-dashboard.html**:

```javascript
// Replace localStorage calls with API calls
async function login(username, password) {
    const response = await fetch('https://your-api-id.execute-api.region.amazonaws.com/prod/api/dj-login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    if (data.success) {
        // Store token securely (consider using httpOnly cookies)
        localStorage.setItem('dj_token', data.token);
        localStorage.setItem('dj_refresh_token', data.refreshToken);
        window.location.href = 'dj-dashboard.html';
    }
}
```

---

## Option 3: Hybrid Approach

Keep static files on Vercel, use AWS only for backend.

**Benefits**:
- Keep Vercel's easy deployment
- Use AWS for secure backend
- Best of both worlds

---

## Cost Estimation

### Static Hosting (S3 + CloudFront)
- S3: ~$0.023/GB storage + $0.005/1000 requests
- CloudFront: ~$0.085/GB data transfer
- **Total**: ~$1-5/month for typical traffic

### Backend Services
- Cognito: Free for first 50,000 MAU
- DynamoDB: ~$1.25/million reads, $1.25/million writes
- Lambda: Free tier (1M requests/month), then $0.20/1M requests
- API Gateway: $3.50/million requests
- **Total**: ~$5-20/month for low-medium traffic

---

## Migration Steps

### Phase 1: Set Up Infrastructure
1. Create AWS account
2. Set up S3 bucket for static hosting
3. Create CloudFront distribution
4. Update DNS to point to CloudFront

### Phase 2: Set Up Backend (Optional)
1. Create Cognito User Pool
2. Create DynamoDB tables
3. Create Lambda functions
4. Set up API Gateway
5. Test API endpoints

### Phase 3: Update Frontend
1. Update authentication code to use Cognito
2. Replace localStorage calls with API calls
3. Update all data operations to use DynamoDB
4. Test thoroughly

### Phase 4: Deploy
1. Deploy static files to S3
2. Deploy Lambda functions
3. Configure API Gateway
4. Test end-to-end
5. Switch DNS

---

## Security Best Practices

1. **Use AWS Cognito** for authentication (not localStorage)
2. **Use IAM roles** for Lambda functions (not hardcoded credentials)
3. **Enable HTTPS** everywhere (CloudFront handles this)
4. **Use DynamoDB encryption** at rest
5. **Enable CloudFront WAF** for DDoS protection
6. **Use API Gateway throttling** to prevent abuse
7. **Store sensitive config** in AWS Secrets Manager
8. **Enable CloudTrail** for audit logging

---

## Quick Start: Static Hosting Only

```bash
# 1. Install AWS CLI
# Mac: brew install awscli
# Or download from: https://aws.amazon.com/cli/

# 2. Configure AWS credentials
aws configure

# 3. Create S3 bucket
aws s3 mb s3://eyp-static-website --region us-east-1

# 4. Enable static website hosting
aws s3 website s3://eyp-static-website \
  --index-document index.html \
  --error-document index.html

# 5. Set bucket policy for public read
# (Create policy.json with public read permissions)
aws s3api put-bucket-policy \
  --bucket eyp-static-website \
  --policy file://policy.json

# 6. Upload files
aws s3 sync . s3://eyp-static-website \
  --exclude "*.git/*" \
  --exclude "*.md" \
  --exclude "node_modules/*" \
  --delete

# 7. Access your site
# URL: http://eyp-static-website.s3-website-us-east-1.amazonaws.com
```

---

## Next Steps

1. **Choose your approach**: Static only, Full backend, or Hybrid
2. **Set up AWS account** if you don't have one
3. **Start with static hosting** to get familiar
4. **Gradually add backend services** as needed
5. **Monitor costs** using AWS Cost Explorer

---

## Resources

- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)

---

## Support

For questions or issues:
1. Check AWS documentation
2. Review AWS CloudWatch logs
3. Check API Gateway logs
4. Review DynamoDB metrics

