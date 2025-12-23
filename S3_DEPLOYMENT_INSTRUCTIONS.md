# S3 Deployment Instructions

## Option 1: Install AWS CLI and Deploy (Recommended)

### Step 1: Install AWS CLI

**On macOS:**
```bash
# Download the installer
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"

# Install
sudo installer -pkg AWSCLIV2.pkg -target /
```

**Or download from:**
https://aws.amazon.com/cli/

### Step 2: Configure AWS Credentials

```bash
aws configure
```

You'll need:
- **AWS Access Key ID**: Get from AWS Console → IAM → Users → Your User → Security Credentials
- **AWS Secret Access Key**: Same location
- **Default region**: e.g., `us-east-1`
- **Default output format**: `json`

### Step 3: Create S3 Bucket (if needed)

```bash
# Replace 'eyp-static-website' with your bucket name
aws s3 mb s3://eyp-static-website --region us-east-1
```

### Step 4: Enable Static Website Hosting

```bash
aws s3 website s3://eyp-static-website \
  --index-document index.html \
  --error-document index.html
```

### Step 5: Set Bucket Policy for Public Access

```bash
# Use the provided s3-bucket-policy.json (update bucket name first)
aws s3api put-bucket-policy \
  --bucket eyp-static-website \
  --policy file://s3-bucket-policy.json
```

### Step 6: Disable Block Public Access

```bash
aws s3api put-public-access-block \
  --bucket eyp-static-website \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

### Step 7: Deploy Files

```bash
# From your project directory
aws s3 sync . s3://eyp-static-website \
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
  --delete
```

### Step 8: Get Your Website URL

```bash
aws s3api get-bucket-website --bucket eyp-static-website
```

Your site will be available at:
`http://eyp-static-website.s3-website-us-east-1.amazonaws.com`

---

## Option 2: Use AWS Console (Web Interface)

### Step 1: Create S3 Bucket

1. Go to https://console.aws.amazon.com/s3/
2. Click "Create bucket"
3. Enter bucket name (e.g., `eyp-static-website`)
4. Choose region (e.g., `us-east-1`)
5. **Uncheck** "Block all public access" (for static hosting)
6. Click "Create bucket"

### Step 2: Enable Static Website Hosting

1. Click on your bucket name
2. Go to "Properties" tab
3. Scroll to "Static website hosting"
4. Click "Edit"
5. Select "Enable"
6. Set:
   - Index document: `index.html`
   - Error document: `index.html`
7. Click "Save changes"
8. Note the "Bucket website endpoint" URL

### Step 3: Set Bucket Policy

1. Go to "Permissions" tab
2. Click "Bucket policy"
3. Paste this policy (replace `eyp-static-website` with your bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::eyp-static-website/*"
    }
  ]
}
```

4. Click "Save changes"

### Step 4: Upload Files

1. Go to "Objects" tab
2. Click "Upload"
3. Click "Add files" or "Add folder"
4. Select all your HTML, CSS, JS, and image files
5. **Exclude**:
   - `.git/` folder
   - `*.md` files
   - `node_modules/`
   - `.DS_Store`
   - `Icon*` files
   - `*.sh` files
   - `aws-config-example.js`
   - `s3-bucket-policy.json`
   - `lambda-functions/` folder
6. Click "Upload"

### Step 5: Access Your Website

Use the "Bucket website endpoint" URL from Step 2.

---

## Option 3: Use the Deployment Script

If you have AWS CLI installed:

```bash
# Make script executable
chmod +x deploy-to-aws.sh

# Edit the script to set your bucket name
# Then run:
./deploy-to-aws.sh
```

---

## Important Files to Upload

✅ **Upload these:**
- All `.html` files
- All `.css` files (if separate)
- All `.js` files (if separate)
- All images (`.jpg`, `.png`, etc.)
- `EYP Logo_New.png`
- All folders with images

❌ **Don't upload:**
- `.git/` folder
- `*.md` files
- `node_modules/`
- `.DS_Store`
- `Icon*` files
- `*.sh` scripts
- `aws-config-example.js`
- `s3-bucket-policy.json`
- `lambda-functions/` folder
- `AWS_SETUP_GUIDE.md`
- `S3_DEPLOYMENT_INSTRUCTIONS.md`

---

## Troubleshooting

### "Access Denied" Error
- Check bucket policy is set correctly
- Verify "Block public access" is disabled
- Ensure bucket name matches in policy

### Files Not Showing
- Clear browser cache
- Check file permissions in S3
- Verify files were uploaded successfully

### 404 Errors
- Ensure `index.html` is in root of bucket
- Check error document is set to `index.html`
- Verify file paths are correct

---

## Next Steps: Add CloudFront CDN (Optional)

For better performance and HTTPS:

1. Go to CloudFront Console
2. Create distribution
3. Origin: Your S3 bucket
4. Enable HTTPS
5. Update DNS to point to CloudFront

---

## Need Help?

- AWS S3 Documentation: https://docs.aws.amazon.com/s3/
- AWS CLI Documentation: https://docs.aws.amazon.com/cli/

