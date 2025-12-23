# Deploy to S3 Bucket: eyp-static

Your bucket name: **eyp-static**

## Option 1: Install AWS CLI and Deploy (Fastest)

### Step 1: Install AWS CLI

```bash
# Download and install
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "/tmp/AWSCLIV2.pkg"
sudo installer -pkg /tmp/AWSCLIV2.pkg -target /

# Verify installation
aws --version
```

### Step 2: Configure AWS

```bash
aws configure
```

You'll need your AWS credentials from: https://console.aws.amazon.com/iam/

### Step 3: Deploy Files

```bash
# Run the upload script
./upload-to-s3.sh eyp-static
```

Or manually:

```bash
aws s3 sync . s3://eyp-static \
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
  --delete
```

---

## Option 2: Use AWS Console (Web Interface)

### Step 1: Go to S3 Console
https://console.aws.amazon.com/s3/

### Step 2: Select Your Bucket
Click on **eyp-static**

### Step 3: Enable Static Website Hosting (if not already enabled)
1. Go to **Properties** tab
2. Scroll to **Static website hosting**
3. Click **Edit**
4. Select **Enable**
5. Set:
   - Index document: `index.html`
   - Error document: `index.html`
6. Click **Save changes**
7. **Copy the "Bucket website endpoint" URL** - this is your website URL!

### Step 4: Set Bucket Policy (if not already set)
1. Go to **Permissions** tab
2. Click **Bucket policy**
3. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::eyp-static/*"
    }
  ]
}
```

4. Click **Save changes**

### Step 5: Disable Block Public Access (if needed)
1. Go to **Permissions** tab
2. Click **Block public access (bucket settings)**
3. Click **Edit**
4. **Uncheck all boxes** (for static website hosting)
5. Click **Save changes**
6. Type `confirm` and click **Confirm**

### Step 6: Upload Files
1. Go to **Objects** tab
2. Click **Upload**
3. Click **Add files** or **Add folder**
4. Select all these files/folders:

**Files to upload:**
- ✅ index.html
- ✅ about.html
- ✅ photography.html
- ✅ videography.html
- ✅ dj-entertainment.html
- ✅ dj-login.html
- ✅ dj-dashboard.html
- ✅ admin-login.html
- ✅ admin-dashboard.html
- ✅ EYP Logo_New.png
- ✅ dj-portal/index.html

**Folders to upload:**
- ✅ AboutUs/
- ✅ Amy and Cody Hardy Wedding/
- ✅ Grace and Dillon Wedding/
- ✅ Homer and Lynnell Wedding/
- ✅ Melissa and Jeremy Engagement Session/
- ✅ Our Videography Services/
- ✅ PhotographyPagePhotos/
- ✅ PhotographyWork/
- ✅ Prom 2025/
- ✅ Tess and Tommy Coward Wedding/
- ✅ Tess and Tommy Engagement Photos/
- ✅ Tray and Kelly Stapleton Wedding/
- ✅ Yazmine and Josh Wedding/
- ✅ DJ Entertainment/

**Don't upload:**
- ❌ .git/ folder
- ❌ *.md files
- ❌ *.sh files
- ❌ Icon* files
- ❌ .DS_Store
- ❌ aws-config-example.js
- ❌ s3-bucket-policy.json
- ❌ lambda-functions/ folder

5. Click **Upload**
6. Wait for upload to complete

### Step 7: Access Your Website

Use the URL from Step 3 (Bucket website endpoint):
```
http://eyp-static.s3-website-us-east-1.amazonaws.com
```
(Region may vary - check your bucket's actual endpoint)

---

## Quick Upload Command (if AWS CLI is installed)

```bash
aws s3 sync . s3://eyp-static \
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

This will:
- ✅ Upload all HTML, images, and folders
- ✅ Exclude unnecessary files
- ✅ Delete files from S3 that no longer exist locally
- ✅ Show progress

---

## Need Help?

- Check bucket exists: Go to https://console.aws.amazon.com/s3/
- Verify static hosting is enabled: Properties → Static website hosting
- Check bucket policy: Permissions → Bucket policy
- View uploaded files: Objects tab

