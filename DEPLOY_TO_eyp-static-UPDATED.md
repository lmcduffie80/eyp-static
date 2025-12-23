# Deploy to S3: s3://eyp-static/eyp-static/

Your files should be uploaded to the **eyp-static/** subdirectory inside the bucket.

## Upload Path
```
s3://eyp-static/eyp-static/
```

---

## Option 1: AWS CLI (Recommended if installed)

### Quick Upload Command

```bash
aws s3 sync . s3://eyp-static/eyp-static/ \
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
  --exclude "DEPLOY_TO_eyp-static-UPDATED.md" \
  --exclude "upload-to-s3.sh" \
  --exclude "upload-to-eyp-static.sh" \
  --delete
```

### Or Use the Script

```bash
./upload-to-eyp-static.sh
```

---

## Option 2: AWS Console (Web Interface)

### Step 1: Go to S3 Console
https://console.aws.amazon.com/s3/buckets/eyp-static

### Step 2: Navigate to Subdirectory
1. Click on the bucket: **eyp-static**
2. If the **eyp-static/** folder doesn't exist, click **Create folder**
3. Name it: `eyp-static`
4. Click **Save**
5. Click into the **eyp-static/** folder

### Step 3: Upload Files
1. Click **Upload**
2. Click **Add files** or **Add folder**
3. Select all your files and folders:

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
- ✅ dj-portal/ (folder)

4. Click **Upload**
5. Wait for upload to complete

### Step 4: Configure Static Website Hosting

Since files are in a subdirectory, you have two options:

**Option A: Set index document to subdirectory**
1. Go to bucket **Properties** tab
2. Scroll to **Static website hosting**
3. Set index document to: `eyp-static/index.html`
4. Set error document to: `eyp-static/index.html`

**Option B: Use CloudFront/Route53**
- Configure CloudFront origin to point to `eyp-static/` folder
- Or use Route53 to route to the subdirectory

---

## Important: Website URL Structure

If using static website hosting with subdirectory:
- Your main site: `http://eyp-static.s3-website-[region].amazonaws.com/eyp-static/`
- Or if configured properly: `http://eyp-static.s3-website-[region].amazonaws.com/`

If using CloudFront:
- Your CloudFront URL will point to the files
- You can configure it to serve from the `eyp-static/` prefix

---

## Verify Upload

After uploading, verify files are in the correct location:

```bash
# List files in the subdirectory
aws s3 ls s3://eyp-static/eyp-static/ --recursive
```

Or in AWS Console:
- Navigate to: `eyp-static` bucket → `eyp-static/` folder
- Verify all files are there

---

## Quick Reference

- **Bucket**: `eyp-static`
- **Upload Path**: `s3://eyp-static/eyp-static/`
- **Files location**: All HTML, images, and folders in the `eyp-static/` subdirectory

