# Quick Start: Deploy to S3

## Do you already have an S3 bucket?

**If YES**, skip to "Upload Files" section below.

**If NO**, follow these steps:

---

## Step 1: Install AWS CLI

### macOS:
```bash
# Download and install AWS CLI
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "/tmp/AWSCLIV2.pkg"
sudo installer -pkg /tmp/AWSCLIV2.pkg -target /
```

Or download from: https://aws.amazon.com/cli/

### Verify installation:
```bash
aws --version
```

---

## Step 2: Configure AWS

```bash
aws configure
```

Enter:
- **AWS Access Key ID**: (Get from AWS Console → IAM → Your User → Security Credentials)
- **AWS Secret Access Key**: (Same location)
- **Default region**: `us-east-1` (or your preferred region)
- **Default output format**: `json`

---

## Step 3: Create S3 Bucket

**Replace `eyp-static-website` with your desired bucket name:**

```bash
# Create bucket
aws s3 mb s3://eyp-static-website --region us-east-1

# Enable static website hosting
aws s3 website s3://eyp-static-website \
  --index-document index.html \
  --error-document index.html

# Set bucket policy (update bucket name in s3-bucket-policy.json first)
aws s3api put-bucket-policy \
  --bucket eyp-static-website \
  --policy file://s3-bucket-policy.json

# Allow public access
aws s3api put-public-access-block \
  --bucket eyp-static-website \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

---

## Step 4: Upload Files

**From your project directory, run:**

```bash
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
  --exclude "AWS_SETUP_GUIDE.md" \
  --exclude "S3_DEPLOYMENT_INSTRUCTIONS.md" \
  --exclude "QUICK_START_S3.md" \
  --exclude "files-to-upload.txt" \
  --delete
```

**This will:**
- Upload all HTML, CSS, JS, and image files
- Upload all image folders
- Exclude unnecessary files
- Delete files from S3 that no longer exist locally

---

## Step 5: Get Your Website URL

```bash
echo "Your website URL:"
echo "http://eyp-static-website.s3-website-us-east-1.amazonaws.com"
```

Or check in AWS Console:
1. Go to S3 → Your bucket → Properties
2. Scroll to "Static website hosting"
3. Copy the "Bucket website endpoint"

---

## Alternative: Use AWS Console (Web Interface)

If you prefer not to use CLI:

1. **Go to**: https://console.aws.amazon.com/s3/
2. **Create bucket** (if needed)
3. **Enable static website hosting** in Properties
4. **Set bucket policy** in Permissions
5. **Upload files** manually via "Upload" button

See `S3_DEPLOYMENT_INSTRUCTIONS.md` for detailed web console steps.

---

## Troubleshooting

**"Access Denied"**
- Check bucket policy is correct
- Verify "Block public access" is disabled

**"Bucket already exists"**
- Use a different bucket name (must be globally unique)
- Or use your existing bucket name

**Files not showing**
- Wait a few seconds for propagation
- Clear browser cache
- Check file permissions in S3

---

## Need Your Bucket Name?

If you already have a bucket, just tell me the name and I can help you upload!

