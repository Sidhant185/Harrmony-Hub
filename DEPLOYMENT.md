# Deployment Guide: Vercel + Neon + Cloudflare R2

This guide will walk you through deploying HarmonyHub to production using Vercel (Next.js hosting), Neon (PostgreSQL database), and Cloudflare R2 (file storage).

## Prerequisites

Before starting, make sure you have:
- **GitHub account** - For version control and code hosting
- **Vercel account** - Free tier available at [vercel.com](https://vercel.com)
- **Neon account** - Free tier available at [neon.tech](https://neon.tech)
- **Cloudflare account** - Free tier available at [cloudflare.com](https://www.cloudflare.com)
- **Google account** - For OAuth setup (optional but recommended)
- **Node.js 18+** - Installed on your local machine
- **Git** - Installed on your local machine

## Step 1: Set Up Neon Database

Neon provides serverless PostgreSQL databases with a generous free tier. This is where all your app data (users, songs, playlists, etc.) will be stored.

### 1.1 Create a Neon Account

1. Go to [neon.tech](https://neon.tech)
2. Click "Sign Up" and create a free account
3. You can sign up with GitHub, Google, or email

### 1.2 Create a New Project

1. After signing in, click "Create a project"
2. Choose a project name (e.g., `harmonyhub`)
3. Select a region closest to your users (e.g., `US East (Ohio)`)
4. Choose PostgreSQL version (latest is recommended)
5. Click "Create project"

### 1.3 Get Your Database Connection String

1. In your Neon dashboard, select your project
2. Click on "Connection Details" or look for the connection string
3. You'll see a connection string that looks like:
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
4. **Important**: Copy the connection string that includes `?sslmode=require` (required for secure connections)
5. Save this connection string securely - you'll need it for environment variables

### 1.4 Run Database Migrations Locally

1. In your project root, create or update your `.env` file:
   ```bash
   DATABASE_URL="your-neon-connection-string-here"
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Push the database schema to Neon:
   ```bash
   npx prisma db push
   ```
   This will create all the necessary tables (User, Song, Playlist, etc.) in your Neon database.

4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

5. Verify the setup:
   - Check your Neon dashboard - you should see tables created
   - The command should complete without errors

**Troubleshooting**:
- If you get connection errors, verify the connection string is correct
- Ensure `sslmode=require` is included in the connection string
- Check that your IP is not blocked (Neon allows all IPs by default)

## Step 2: Set Up Cloudflare R2

Cloudflare R2 is an S3-compatible object storage service with no egress fees, perfect for storing music files. The free tier includes 10GB storage and 1M operations per month.

### 2.1 Create a Cloudflare Account

1. Go to [cloudflare.com](https://www.cloudflare.com)
2. Click "Sign Up" and create a free account
3. Complete the account verification (email verification required)

### 2.2 Enable R2 (Object Storage)

1. In your Cloudflare dashboard, look for "R2" in the left sidebar
2. If you don't see it, you may need to enable it:
   - Go to your account settings
   - R2 should be available on the free plan
3. Click on "R2" to access the R2 dashboard
4. You may see a "Get Started" or "Create Bucket" button - click it

### 2.3 Create an R2 Bucket

1. In the R2 dashboard, click "Create bucket"
2. Enter a unique bucket name:
   - Example: `harmonyhub-music-storage`
   - Bucket names must be globally unique across all R2 buckets
   - Use lowercase letters, numbers, and hyphens only
   - Cannot start or end with a hyphen
3. Click "Create bucket"
4. Your bucket is now ready to use

### 2.4 Get Your Account ID

1. In the R2 dashboard, look at the top of the page
2. You'll see your Account ID displayed (a long alphanumeric string)
3. Copy this value - you'll need it for the `R2_ACCOUNT_ID` environment variable
4. Example format: `4dc0cbd00b035b8a67b5b1c0c13a9314`

### 2.5 Create R2 API Token

1. In the R2 dashboard, click "Manage R2 API Tokens"
2. Click "Create API Token"
3. **Token Type Selection**:
   - **Recommended**: Choose **"Account API Token"**
     - These tokens are tied to your Cloudflare account
     - They remain valid even if users are removed
     - Better for production deployments
     - **Note**: Only Super Administrators can create Account tokens
   - **Alternative**: If you don't have Super Admin access, use "User API Token"
     - These are tied to a specific user
     - Will become inactive if the user is removed
4. **Configure Token**:
   - Token name: `harmonyhub-r2-token` (or any descriptive name)
   - Permissions: Select **"Object Read & Write"**
     - This allows uploading, downloading, and managing files
     - For more control, you can scope to specific buckets
   - TTL (Time To Live): Leave as "Never expire" for production
     - Or set an expiration date if you prefer
5. Click "Create API Token"
6. **CRITICAL**: Copy both values immediately:
   - **Access Key ID** - Looks like: `9e9a4eb82e153e35a3743b3fe0f6c0c9`
   - **Secret Access Key** - A long string (shown only once!)
   - Store these securely - you cannot retrieve the secret key later

### 2.6 Configure Bucket for Public Access

1. Go to your bucket in the R2 dashboard
2. Click on the "Settings" tab
3. Scroll down to find "Public Access" section
4. Click "Allow Access" or toggle the switch to enable public read access
5. This allows your music files to be publicly accessible via URLs
6. **Note**: Files will be readable by anyone with the URL, which is needed for music playback

### 2.7 Get Public URL (R2.dev Subdomain)

1. After enabling public access, R2 automatically provides a public URL
2. The format is: `https://pub-xxxxx.r2.dev`
3. You can find this in your bucket settings under "Public Access"
4. Copy this URL - you'll use it for the `R2_PUBLIC_URL` environment variable
5. Example: `pub-c46049750aca469fb26fffe3266bf489.r2.dev`

### 2.8 Optional: Set Up Custom Domain

For better performance and branding, you can use a custom domain:

1. In your bucket settings, go to "Custom Domains"
2. Click "Connect Domain"
3. Enter your domain (e.g., `cdn.yourdomain.com` or `media.yourdomain.com`)
4. Follow the DNS configuration instructions:
   - Add a CNAME record in your domain's DNS settings
   - Point it to the R2 endpoint provided
5. Wait for DNS propagation (can take a few minutes to hours)
6. Once active, update `R2_PUBLIC_URL` in your environment variables to use your custom domain

## Step 3: Set Up Google OAuth (Optional but Recommended)

Google OAuth allows users to sign in with their Google account, providing a seamless authentication experience.

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Sign in with your Google account
   - Click "Select a project" → "New Project"
   - Enter project name: `HarmonyHub` (or your preferred name)
   - Click "Create"

2. **Enable Google+ API**
   - In your project, go to "APIs & Services" → "Library"
   - Search for "Google+ API" or "Google Identity"
   - Click on it and click "Enable"

3. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" (unless you have a Google Workspace account)
   - Click "Create"
   - Fill in the required information:
     - **App name**: HarmonyHub (or your app name)
     - **User support email**: Your email address
     - **Developer contact information**: Your email address
   - Click "Save and Continue"
   - On "Scopes" page, click "Save and Continue" (default scopes are fine)
   - On "Test users" page, you can add test users if needed, then click "Save and Continue"
   - Review and click "Back to Dashboard"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application" as the application type
   - Name: `HarmonyHub Web Client`
   - **Authorized JavaScript origins**:
     - For development: `http://localhost:3000`
     - For production: `https://your-app.vercel.app` (add this after deployment)
   - **Authorized redirect URIs**:
     - For development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://your-app.vercel.app/api/auth/callback/google` (add this after deployment)
   - Click "Create"
   - **Important**: Copy the Client ID and Client Secret immediately
   - Save these credentials securely

5. **Update Environment Variables**
   - Add to your `.env` file:
     ```
     GOOGLE_CLIENT_ID=your-google-client-id
     GOOGLE_CLIENT_SECRET=your-google-client-secret
     ```
   - For Vercel deployment, add these to your environment variables

6. **Update OAuth Settings After Deployment**
   - Once your app is deployed on Vercel, go back to Google Cloud Console
   - Edit your OAuth 2.0 Client ID
   - Add your production URLs:
     - Authorized JavaScript origins: `https://your-app.vercel.app`
     - Authorized redirect URIs: `https://your-app.vercel.app/api/auth/callback/google`
   - Save the changes

**Note**: If you don't set up Google OAuth, users can still sign in using email/password. Google OAuth is optional but provides a better user experience.

## Step 4: Deploy to Vercel

Vercel provides excellent Next.js hosting with automatic deployments, global CDN, and a generous free tier.

### 4.1 Prepare Your Code

1. Make sure all your code is committed to Git:
   ```bash
   git status  # Check for uncommitted changes
   git add .
   git commit -m "Prepare for deployment"
   ```

2. Push to GitHub:
   ```bash
   git push origin main
   ```
   (Replace `main` with your branch name if different)

### 4.2 Create Vercel Account and Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" and choose "Continue with GitHub"
3. Authorize Vercel to access your GitHub repositories
4. After signing in, click "Add New Project"
5. Select your HarmonyHub repository from the list
6. Vercel will auto-detect Next.js settings:
   - Framework Preset: Next.js
   - Build Command: `next build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)
7. Click "Deploy" (we'll configure environment variables next)

### 4.3 Configure Environment Variables

1. After the initial deployment starts, go to your project settings
2. Navigate to "Settings" → "Environment Variables"
3. Add each variable one by one:

   **Required Variables:**
   
   ```
   DATABASE_URL
   Value: your-neon-connection-string
   ```
   
   ```
   NEXTAUTH_URL
   Value: https://your-app.vercel.app (replace with your actual Vercel URL)
   ```
   
   ```
   NEXTAUTH_SECRET
   Value: [Generate using: openssl rand -base64 32]
   ```
   
   ```
   R2_ACCOUNT_ID
   Value: your-cloudflare-account-id
   ```
   
   ```
   R2_ACCESS_KEY_ID
   Value: your-r2-access-key-id
   ```
   
   ```
   R2_SECRET_ACCESS_KEY
   Value: your-r2-secret-access-key
   ```
   
   ```
   R2_BUCKET_NAME
   Value: your-bucket-name
   ```
   
   ```
   R2_PUBLIC_URL
   Value: pub-xxxxx.r2.dev (your R2 public URL)
   ```
   
   **Optional Variables (for Google OAuth):**
   
   ```
   GOOGLE_CLIENT_ID
   Value: your-google-client-id
   ```
   
   ```
   GOOGLE_CLIENT_SECRET
   Value: your-google-client-secret
   ```
   
   ```
   NODE_ENV
   Value: production
   ```

4. **Generate NEXTAUTH_SECRET**:
   - On Mac/Linux, run in terminal:
     ```bash
     openssl rand -base64 32
     ```
   - On Windows (PowerShell):
     ```powershell
     -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
     ```
   - Or use an online generator: [generate-secret.vercel.app](https://generate-secret.vercel.app/32)
   - Copy the generated string and paste it as the value for `NEXTAUTH_SECRET`

5. **Important**: Make sure to select "Production", "Preview", and "Development" for each variable (or at least "Production")

### 4.4 Redeploy with Environment Variables

1. After adding all environment variables, go to the "Deployments" tab
2. Click the three dots (⋯) on your latest deployment
3. Click "Redeploy"
4. Or push a new commit to trigger automatic redeployment:
   ```bash
   git commit --allow-empty -m "Trigger redeploy with env vars"
   git push origin main
   ```

### 4.5 Verify Deployment

1. Wait for the deployment to complete (usually 2-5 minutes)
2. Click on your deployment to see build logs
3. Check for any errors in the build process
4. Once successful, click "Visit" to see your live application
5. Test the application:
   - Try signing up/logging in
   - Test Google OAuth (if configured)
   - Upload a test song
   - Verify music playback works

### 4.6 Update NEXTAUTH_URL After First Deployment

1. After your first successful deployment, note your Vercel URL
2. Go to "Settings" → "Environment Variables"
3. Update `NEXTAUTH_URL` to match your actual Vercel domain:
   - Example: `https://harmonyhub.vercel.app`
4. If you set up a custom domain, update it to that instead
5. Redeploy the application for changes to take effect

## Step 5: Post-Deployment Setup

1. **Run Database Migrations on Production**
   - In Vercel, go to your project → Settings → Environment Variables
   - Copy your `DATABASE_URL`
   - Run locally with production DATABASE_URL:
   ```bash
   DATABASE_URL="your-production-db-url" npx prisma db push
   DATABASE_URL="your-production-db-url" npx prisma generate
   ```

   Or use Vercel CLI:
   ```bash
   vercel env pull .env.production
   npx prisma db push
   ```

2. **Seed Database (Optional)**
   ```bash
   DATABASE_URL="your-production-db-url" npm run db:seed
   ```

3. **Test Your Deployment**
   - Visit your Vercel URL
   - Test user registration/login with email/password
   - Test Google OAuth login (if configured)
   - Test file upload
   - Verify files are uploaded to R2 (check R2 dashboard or use the public URL)
   - Test music playback
   - Verify all features are working correctly

## Step 6: Custom Domain (Optional)

1. **Add Custom Domain in Vercel**
   - Go to your project → Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Environment Variables**
   - Update `NEXTAUTH_URL` to your custom domain
   - Redeploy

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct in Vercel
- Check Neon dashboard for connection status
- Ensure SSL mode is enabled (`?sslmode=require`)

### R2 Upload Failures
- Verify R2 credentials are correct (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`)
- Check bucket permissions (ensure public access is enabled if needed)
- Verify bucket name matches `R2_BUCKET_NAME`
- Check that the R2 API token has proper permissions
- Verify the bucket exists in your Cloudflare account

### NextAuth Issues
- Ensure `NEXTAUTH_URL` matches your deployment URL
- Verify `NEXTAUTH_SECRET` is set
- Check callback URLs in NextAuth configuration
- For Google OAuth: Verify redirect URIs in Google Cloud Console match your deployment URL
- Ensure Google OAuth credentials are correctly set in environment variables

### Build Failures
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

## Monitoring and Maintenance

1. **Vercel Analytics** (Optional)
   - Enable Vercel Analytics in project settings
   - Monitor performance and errors

2. **Database Monitoring**
   - Use Neon dashboard to monitor database usage
   - Set up alerts for storage limits

3. **R2 Monitoring**
   - Monitor R2 storage usage in Cloudflare dashboard
   - Set up billing alerts in Cloudflare (if needed)
   - Check R2 analytics for usage patterns

## Cost Estimation (Free Tier)

- **Vercel**: Free tier includes 100GB bandwidth/month
- **Neon**: Free tier includes 0.5GB storage, 1 project
- **Cloudflare R2**: Free tier includes 10GB storage, 1M Class A operations/month, **NO egress fees** (unlimited downloads)

## Security Best Practices

1. **Never commit `.env` files**
2. **Use environment variables for all secrets**
3. **Rotate R2 API tokens periodically**
4. **Use custom domain with SSL** for R2 (recommended)
5. **Set up Cloudflare Analytics** for monitoring
6. **Limit R2 API token permissions** to only what's needed (Object Read & Write)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Cloudflare R2 dashboard for errors
3. Review Neon connection logs
4. Check browser console for client-side errors
5. Verify R2 bucket public access settings

---

**Congratulations! Your music platform is now live! 🎉**

