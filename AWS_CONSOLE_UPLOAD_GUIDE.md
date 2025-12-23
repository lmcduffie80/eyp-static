# AWS Console Upload Guide - Step by Step

## Upload to: s3://eyp-static/eyp-static/

---

## Step 1: Open AWS S3 Console

1. Go to: https://console.aws.amazon.com/s3/
2. Sign in to your AWS account

---

## Step 2: Navigate to Your Bucket

1. Click on the bucket named **eyp-static**
2. You should see the folder structure

---

## Step 3: Navigate to or Create the eyp-static/ Folder

1. **If the `eyp-static/` folder already exists:**
   - Click on the folder name to open it
   - Continue to Step 4

2. **If the `eyp-static/` folder does NOT exist:**
   - Click the **"Create folder"** button (top right)
   - Enter folder name: `eyp-static`
   - Click **"Create folder"**
   - Click on the new `eyp-static` folder to open it

---

## Step 4: Upload Your Files

### 4a. Click "Upload" Button
- Click the blue **"Upload"** button at the top

### 4b. Add Files and Folders
Click **"Add files"** or **"Add folder"** and select:

**📄 Individual Files to Upload:**
- `index.html`
- `about.html`
- `photography.html`
- `videography.html`
- `dj-entertainment.html`
- `dj-login.html`
- `dj-dashboard.html`
- `admin-login.html`
- `admin-dashboard.html`
- `EYP Logo_New.png`

**📁 Folders to Upload (select entire folders):**
- `AboutUs/`
- `Amy and Cody Hardy Wedding/`
- `Grace and Dillon Wedding/`
- `Homer and Lynnell Wedding/`
- `Melissa and Jeremy Engagement Session/`
- `Our Videography Services/`
- `PhotographyPagePhotos/`
- `PhotographyWork/`
- `Prom 2025/`
- `Tess and Tommy Coward Wedding/`
- `Tess and Tommy Engagement Photos/`
- `Tray and Kelly Stapleton Wedding/`
- `Yazmine and Josh Wedding/`
- `DJ Entertainment/`
- `dj-portal/` (this folder contains `index.html`)

**❌ DO NOT Upload:**
- `.git/` folder
- Any `.md` files (markdown documentation)
- Any `.sh` files (shell scripts)
- `Icon*` files
- `.DS_Store` files
- `aws-config-example.js`
- `s3-bucket-policy.json`
- `lambda-functions/` folder

### 4c. Start Upload
- Review the files list
- Click **"Upload"** button at the bottom
- Wait for upload to complete (you'll see progress)

---

## Step 5: Verify Upload

After upload completes:

1. You should see all your files listed in the `eyp-static/` folder
2. Check that:
   - ✅ All HTML files are present
   - ✅ All image folders are present
   - ✅ `EYP Logo_New.png` is present
   - ✅ `dj-portal/index.html` is in the `dj-portal/` folder

---

## Step 6: Configure Static Website Hosting (If Needed)

If you want to serve this as a website:

1. Go back to the bucket root (click **eyp-static** breadcrumb at top)
2. Click the **"Properties"** tab
3. Scroll down to **"Static website hosting"**
4. Click **"Edit"**
5. Select **"Enable"**
6. Set:
   - **Index document**: `eyp-static/index.html`
   - **Error document**: `eyp-static/index.html`
7. Click **"Save changes"**
8. **Copy the "Bucket website endpoint" URL** - this is your website URL!

---

## Step 7: Set Bucket Permissions (If Not Already Set)

If files aren't accessible:

1. Go to **"Permissions"** tab
2. Scroll to **"Bucket policy"**
3. Click **"Edit"**
4. Paste this policy:

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

5. Click **"Save changes"**

---

## Quick Checklist

- [ ] Opened AWS S3 Console
- [ ] Navigated to `eyp-static` bucket
- [ ] Opened or created `eyp-static/` folder
- [ ] Uploaded all HTML files
- [ ] Uploaded all image folders
- [ ] Uploaded `EYP Logo_New.png`
- [ ] Verified all files are present
- [ ] Configured static website hosting (if needed)
- [ ] Set bucket policy for public access (if needed)

---

## Your Website URL

After configuration, your website will be available at:
```
http://eyp-static.s3-website-[region].amazonaws.com/eyp-static/
```

Replace `[region]` with your actual AWS region (e.g., `us-east-1`).

You can find the exact URL in:
- **Properties** tab → **Static website hosting** → **Bucket website endpoint**

---

## Need Help?

- **Files not showing?** Check you're in the `eyp-static/` folder inside the bucket
- **Upload failed?** Check file sizes (S3 has limits) and your AWS permissions
- **Can't access website?** Verify static website hosting is enabled and bucket policy is set

