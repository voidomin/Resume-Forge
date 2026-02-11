# 🚀 Free Deployment Guide - Resume Builder

**Complete step-by-step guide for deploying to production using FREE services**

---

## 📊 Deployment Architecture

```
Your GitHub Repo
        ↓
   ┌────┴────┐
   ↓         ↓
Vercel    Render         Neon
Frontend  Backend    PostgreSQL
```

**Services Used:**

- **Frontend:** Vercel (auto-deploys from GitHub)
- **Backend:** Render (free tier with 5GB storage)
- **Database:** Neon (free PostgreSQL with 3 projects)
- **API Key:** Google AI Studio (free Gemini API)

**Cost:** $0/month ✅

---

## ✅ Prerequisites (5 minutes)

You need:

1. GitHub account (you have this ✓)
2. Google account (for Gemini API)
3. That's it!

---

## 🛠️ STEP 1: Set Up Free PostgreSQL Database (15 minutes)

### 1.1 Create Neon Account

1. Go to: https://console.neon.tech/
2. Click **Sign Up**
3. Choose **Sign up with GitHub** (easier!)
4. Authorize Neon access
5. Click **Next** on welcome screen

### 1.2 Create Database Project

1. Click **Create a Project**
2. **Name:** `resume-builder` (or any name)
3. **Database name:** `resume_builder`
4. **Postgres version:** 16
5. Click **Create Project**

### 1.3 Get Connection String

1. Go to **Connection String** tab
2. Copy the connection string that looks like:
   ```
   postgresql://user:password@ep-xxxx.us-east-1.aws.neon.tech/resume_builder
   ```
3. **Save it somewhere safe** - you'll need this later!

---

## 🛠️ STEP 2: Set Up Gemini API (5 minutes)

### 2.1 Get Free Gemini API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Click **Create API Key**
3. Select **Create API key in new Google Cloud project**
4. Copy the API key
5. **Save it** - you'll need this!

---

## 🛠️ STEP 3: Deploy Backend to Render (20 minutes)

### 3.1 Create Render Account

1. Go to: https://render.com
2. Click **Sign up**
3. Choose **Continue with GitHub**
4. Authorize Render

### 3.2 Create Web Service

1. From dashboard, click **New +** → **Web Service**
2. Choose **Build and deploy from a Git repository**
3. Click **Connect account** under GitHub
4. Find and select **Resume-Forge** repository
5. Click **Connect**

### 3.3 Configure Deployment

Fill in these fields:

| Field             | Value                                                       |
| ----------------- | ----------------------------------------------------------- |
| **Name**          | `resume-builder-api`                                        |
| **Environment**   | `Node`                                                      |
| **Region**        | `Oregon` (or closest to you)                                |
| **Branch**        | `main`                                                      |
| **Build Command** | `cd resume-builder/backend && npm install && npm run build` |
| **Start Command** | `cd resume-builder/backend && npm start`                    |

### 3.4 Add Environment Variables

Click **Environment** section and add:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://[paste-neon-connection-string]
JWT_SECRET=[generate below]
GEMINI_API_KEY=[paste-gemini-api-key]
```

**To generate JWT_SECRET:**

- Go to: https://www.uuidgenerator.net/
- Generate and copy a UUID (it's a temporary password)

### 3.5 Deploy

1. Click **Deploy Web Service**
2. Wait ~3-5 minutes (watch the logs)
3. When done, you'll see: **"Your service is live"**
4. **Copy the URL** (looks like: `https://resume-builder-api.onrender.com`)

### ⚠️ Fix Cold Start Issue

Free Render services sleep after 15 minutes. To reactivate:

1. Go to service settings
2. Set a **cron job** to ping endpoint every 10 minutes
3. Or accept the 30-second cold start (your choice)

---

## 🛠️ STEP 4: Deploy Frontend to Vercel (15 minutes)

### 4.1 Create Vercel Account

1. Go to: https://vercel.com
2. Click **Sign Up**
3. Choose **Continue with GitHub**
4. Authorize Vercel to access repositories

### 4.2 Import Project

1. Click **Import Project**
2. Paste GitHub URL: `https://github.com/voidomin/Resume-Forge`
3. Click **Continue**

### 4.3 Configure Frontend

| Field                | Value                     |
| -------------------- | ------------------------- |
| **Project Name**     | `resume-builder`          |
| **Framework Preset** | `Vite`                    |
| **Root Directory**   | `resume-builder/frontend` |

### 4.4 Add Environment Variables

Click **Environment Variables** and add:

```
VITE_API_BASE_URL=https://resume-builder-api.onrender.com/api
```

(Replace with your actual Render backend URL from Step 3.5)

### 4.5 Deploy

1. Click **Deploy**
2. Wait ~2-3 minutes
3. When complete, you'll see **"Congratulations! Your site is live"**
4. **Copy your Vercel URL** (looks like: `https://resume-builder.vercel.app`)

---

## 🛠️ STEP 5: Connect Database to Backend

### 5.1 Run Database Migrations on Render

The backend will automatically run migrations on first start, BUT let's verify:

1. Go to Render backend dashboard
2. Click **Shell** tab
3. Run command:
   ```bash
   cd resume-builder/backend && DATABASE_URL=$DATABASE_URL npx prisma migrate deploy
   ```

---

## ✅ STEP 6: Test Your Live Application

### 6.1 Test Backend Health

```bash
curl https://resume-builder-api.onrender.com/health
```

You should see: `{"status":"ok"}`

### 6.2 Test Frontend

1. Go to your Vercel URL: `https://resume-builder.vercel.app`
2. Try to **register** a new account
3. Try to **login**
4. Go to **Profile** and add some info
5. Try **Resume Generation**

---

## 🎯 Summary - What You've Set Up

| Component       | Service       | Cost   | URL                                     |
| --------------- | ------------- | ------ | --------------------------------------- |
| **Database**    | Neon          | FREE   | Internal                                |
| **Backend API** | Render        | FREE   | https://resume-builder-api.onrender.com |
| **Frontend UI** | Vercel        | FREE   | https://resume-builder.vercel.app       |
| **AI Service**  | Google Gemini | FREE\* | Internal                                |

\*Free tier: 60 requests/minute (more than enough!)

---

## 🔄 How Updates Work

### When You Push Code to GitHub:

**Frontend:**

1. Push to `main` branch
2. Vercel auto-detects change
3. Auto-builds and deploys (2-3 min)
4. Your site updates automatically ✅

**Backend:**

1. Push to `main` branch
2. Render auto-detects change
3. Auto-builds and deploys (3-5 min)
4. Your API updates automatically ✅

---

## ⚠️ Important Notes

### Limitations of Free Tier

| Service    | Limitation              | Impact                       |
| ---------- | ----------------------- | ---------------------------- |
| **Neon**   | 3 projects              | Can run 3 separate instances |
| **Render** | 10GB/month bandwidth    | ~50K requests                |
| **Render** | 15 min inactivity sleep | 30-sec cold start            |
| **Vercel** | 1 concurrent build      | Fast enough for learning     |
| **Gemini** | 60 req/min              | Fine for typical usage       |

### Best Practices

1. **Don't commit .env files** - Use environment variables on deployment platforms
2. **Keep database backups** - Export from Neon regularly
3. **Monitor cold starts** - Check Render logs if slow
4. **Test before pushing** - Run locally first

---

## 🆘 Troubleshooting

### Issue: "Connection refused" on frontend

**Solution:** Update `VITE_API_BASE_URL` in Vercel environment with correct Render URL

### Issue: Backend slow to respond first time

**Solution:** Render free tier sleeps. Either:

- Add a cron job to ping it
- Or just wait 30 seconds after starting

### Issue: Database not accessible

**Solution:** Verify DATABASE_URL in Render environment is exactly from Neon

### Issue: Cannot register/login

**Solution:** Check Render logs - likely DATABASE_URL issue

```bash
# In Render dashboard → Logs tab
# Look for database connection errors
```

---

## 🎬 Next Steps

1. ✅ You have a **free production app**
2. ✅ **Auto-deploys** when you push to GitHub
3. ✅ **Fully functional** with all features
4. ✅ **Scalable** if you upgrade later

### When You're Ready to Upgrade

- **Higher traffic?** Upgrade Render plan ($7/month)
- **More database?** Upgrade Neon plan ($5/month)
- **Custom domain?** Buy domain ($12/year)

---

## 📋 Quick Reference URLs

Once deployed, you'll have these URLs:

```
Frontend:  https://resume-builder.vercel.app
Backend:   https://resume-builder-api.onrender.com
Database:  Managed by Neon console
```

---

**You're ready to deploy! Start with Step 1 above.** 🚀
