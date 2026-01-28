# 🚀 Complete Railway Deployment Guide
## Lagos Bright Futures Initiative

This guide will walk you through deploying your application to Railway step-by-step.

---

## Prerequisites

Before you begin, you need:
1. ✅ A GitHub account (free)
2. ✅ A Railway account (free - visit https://railway.app)
3. ✅ This code repository

---

## Deployment Steps

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your GitHub account

### Step 2: Push Code to GitHub (If not already done)

```bash
# Initialize git repository
cd lagos-bright-futures
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Lagos Bright Futures Initiative"

# Create a new repository on GitHub (via web interface)
# Then link and push:
git remote add origin https://github.com/YOUR_USERNAME/lagos-bright-futures.git
git branch -M main
git push -u origin main
```

### Step 3: Create New Project in Railway

1. Login to Railway Dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Select your `lagos-bright-futures` repository
5. Railway will start deploying automatically

### Step 4: Add PostgreSQL Database

1. In your project dashboard, click **"New"**
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Railway will provision a database and add `DATABASE_URL` to your environment

### Step 5: Configure Environment Variables

1. Click on your web service (the one running your app)
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** and add these:

```
JWT_SECRET = your-very-secure-random-string-here-change-this
NODE_ENV = production
PORT = 5000
```

**IMPORTANT:** For `JWT_SECRET`, use a long random string. You can generate one at:
https://www.uuidgenerator.net/ or use this command:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 6: Initialize Database Schema

After your app is deployed:

**Option A: Using Railway Dashboard**
1. Go to your PostgreSQL database service
2. Click **"Data"** tab
3. Click **"Query"**
4. Copy and paste the entire contents of `server/schema.sql`
5. Click **"Run"**

**Option B: Using Railway CLI** (Recommended if you're comfortable with terminal)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run schema
railway run psql $DATABASE_URL < server/schema.sql
```

### Step 7: Generate Domain & Access Your App

1. In Railway dashboard, click on your web service
2. Go to **"Settings"** tab
3. Scroll to **"Domains"**
4. Click **"Generate Domain"**
5. Your app will be live at: `https://your-project-name.up.railway.app`

**🎉 Your app is now live!**

---

## Post-Deployment Steps

### 1. Test the Application

Visit your Railway URL and:
- ✅ Check if the landing page loads
- ✅ Try registering a new account
- ✅ Login with the default admin credentials:
  - Email: `admin@lagosbrightfutures.org`
  - Password: `admin123`

### 2. Change Default Admin Password

**CRITICAL SECURITY STEP:**
1. Login as admin
2. Go to profile settings (you'll need to add this feature or manually update in database)
3. Change the default password immediately

To manually update in database:
```sql
-- Generate a new password hash for 'newpassword123'
-- Run this in Railway PostgreSQL Query tab

UPDATE users 
SET password = '$2a$10$NEW_HASH_HERE' 
WHERE email = 'admin@lagosbrightfutures.org';
```

### 3. Add Custom Domain (Optional)

1. Purchase a domain (e.g., lagosbrightfutures.org)
2. In Railway: Settings → Domains → Custom Domain
3. Add your domain and follow DNS configuration steps

---

## Monitoring & Maintenance

### View Logs
1. Click on your service in Railway
2. Go to **"Deployments"** tab
3. Click on latest deployment
4. View real-time logs

### Database Backups
Railway automatically backs up PostgreSQL databases. To create manual backup:
1. Go to PostgreSQL service
2. Click **"Data"** tab
3. Use export functionality

### Update Application
Simply push to your GitHub repository:
```bash
git add .
git commit -m "Update application"
git push
```
Railway will automatically redeploy!

---

## Troubleshooting

### Application Won't Start

**Check:**
1. ✅ Environment variables are set correctly
2. ✅ Database schema has been initialized
3. ✅ Build logs for errors (Deployments → View Logs)

**Common Issues:**
```
Error: "Cannot find module"
→ Solution: Check package.json and rebuild

Error: "Database connection failed"
→ Solution: Verify DATABASE_URL is set correctly

Error: "Port already in use"
→ Solution: Don't set custom PORT, Railway handles this
```

### Database Connection Issues

1. Check DATABASE_URL in Variables tab
2. Ensure PostgreSQL service is running
3. Verify schema was initialized

### Build Failures

1. Check build logs in Railway dashboard
2. Ensure all dependencies are in package.json
3. Verify build script runs successfully locally

---

## Cost Estimation

**Railway Free Tier:**
- ✅ $5 free credit per month
- ✅ Suitable for MVP testing
- ✅ ~500 hours of runtime

**For Production:**
- Starter Plan: $5/month
- Includes PostgreSQL database
- More resources and uptime

---

## Next Steps After Deployment

1. **Share with Stakeholders**
   - Lagos State Ministry officials
   - NGO partners
   - Test users

2. **Gather Feedback**
   - User experience
   - Missing features
   - Performance issues

3. **Iterate**
   - Add Phase 2 features (e-learning, sponsorship)
   - Improve based on feedback
   - Scale as needed

---

## Support

**Need Help?**
- 📧 Railway Support: help@railway.app
- 📚 Railway Docs: https://docs.railway.app
- 💬 Railway Discord: https://discord.gg/railway

**Project Issues?**
- Create an issue in your GitHub repository
- Document errors with screenshots
- Share logs from Railway dashboard

---

## Security Checklist

Before going live:
- ✅ Change default admin password
- ✅ Use strong JWT_SECRET
- ✅ Enable HTTPS (automatic with Railway)
- ✅ Review user permissions
- ✅ Test file upload limits
- ✅ Configure CORS properly

---

**🎉 Congratulations on deploying Lagos Bright Futures Initiative!**

You're now ready to make an impact for vulnerable children in Lagos State.
