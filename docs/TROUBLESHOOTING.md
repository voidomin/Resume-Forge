# Resume Forge - Troubleshooting Guide

This guide covers common issues and solutions for Resume Forge users and administrators.

---

## Table of Contents

1. [Authentication Issues](#authentication-issues)
2. [Profile & Data Issues](#profile--data-issues)
3. [Resume Generation Issues](#resume-generation-issues)
4. [Export & Download Issues](#export--download-issues)
5. [Frontend Issues](#frontend-issues)
6. [Backend & Server Issues](#backend--server-issues)
7. [Database Issues](#database-issues)
8. [Performance Issues](#performance-issues)
9. [Deployment Issues](#deployment-issues)

---

## Authentication Issues

### Problem: "Invalid email or password" despite correct credentials

**Symptoms**: Login fails repeatedly with valid email/password

**Solutions**:
1. **Clear browser cache & cookies**
   - Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Clear all browsing data from the beginning of time
   - Refresh the page

2. **Check email format**
   - Ensure no extra spaces before/after email
   - Use lowercase email (some systems are case-sensitive)

3. **Verify account exists**
   - Try registering again with the same email
   - If "email already exists" error appears, account exists

4. **Check database connectivity**
   - If still failing, contact support with timestamp

**Error Message in Console**: 
```
Error: Invalid email or password
Status: 401
```

---

### Problem: Session expires quickly or token not recognized

**Symptoms**: Get logged out after a few minutes; "Invalid token" errors

**Solutions**:

1. **Check JWT Secret configuration**
   - Backend must have `JWT_SECRET` env variable set
   - If changed, all existing tokens become invalid (users must re-login)
   - Use: `openssl rand -hex 32` to generate a strong secret

2. **Verify token expiration settings**
   - Default: 7 days
   - Check in [resume-builder/backend/src/routes/auth.routes.ts](resume-builder/backend/src/routes/auth.routes.ts) line with `expiresIn: "7d"`

3. **Check system time**
   - If server system time is wrong, JWT validation fails
   - Verify server time is synchronized (use NTP)

4. **Clear localStorage**
   - Open DevTools → Application → Storage → Local Storage
   - Delete the `token` entry
   - Log in again

**Fix**: Restart backend and clear browser storage

---

### Problem: "Account already exists" when trying to register

**Symptoms**: Registration fails with duplicate account error

**Solutions**:

1. **Email already registered**
   - Use "Forgot Password" (if available)
   - Or contact support to recover/reset account

2. **Create account with different email**
   - Use a new email address
   - Example: `email+2@domain.com`

---

## Profile & Data Issues

### Problem: Profile changes not saving

**Symptoms**: Edit profile, click save, but changes don't persist

**Solutions**:

1. **Check browser console for errors**
   - Open DevTools (F12) → Console tab
   - Look for red error messages
   - Share screenshot with support

2. **Verify API connectivity**
   - Open DevTools → Network tab
   - Click Save and watch for the `/api/profile` request
   - Check if response is 200 (success) or error (4xx/5xx)

3. **Check required fields**
   - All required fields must be filled:
     - First name, last name, email
   - Try saving with minimal data first

4. **Reload page after save**
   - After saving, refresh the page (F5)
   - Navigate away and back to profile
   - Check if changes persisted

**Debug Steps**:
```
1. Open DevTools (F12)
2. Go to Network tab
3. Fill profile form
4. Click Save
5. Look for POST /api/profile request
6. Click the request and check Response tab
7. If error, share the error message
```

---

### Problem: Can't add experiences/education/skills

**Symptoms**: "Add" button doesn't work or form won't submit

**Solutions**:

1. **Check for validation errors**
   - Are all required fields filled?
   - Experience: Company, Role, Start Date required
   - Education: Institution, Degree, Field required
   - Skill: Name and Category required

2. **Check field formats**
   - **Dates**: Must be in format YYYY-MM-DD (e.g., 2023-01-15)
   - **GPA**: Must be valid decimal (e.g., 3.8)
   - **URLs**: Must start with http:// or https://

3. **Check for special characters**
   - Avoid special characters in text fields
   - Use standard punctuation only (periods, commas, hyphens)

4. **Check browser compatibility**
   - Use Chrome, Firefox, Safari, or Edge
   - Not supported: Internet Explorer

---

### Problem: Imported profile data is incomplete or corrupted

**Symptoms**: Data missing after import or import fails

**Solutions**:

1. **Check import file format**
   - Supported formats: PDF, DOCX
   - File size must be < 5MB
   - Ensure file is not corrupted

2. **Try manual re-entry**
   - If import fails, manually add experiences/education/skills
   - Copy-paste from your original resume as needed

3. **Check file readability**
   - Open PDF/DOCX manually to ensure it's readable
   - Try converting PDF to DOCX or vice versa using online tools

---

## Resume Generation Issues

### Problem: AI fails to generate resume ("All models failed")

**Symptoms**: 
- Generation spins indefinitely
- Error: "All AI models failed to generate resume"
- Resume shows fallback template

**Solutions**:

1. **Check API key configuration**
   - Verify `GEMINI_API_KEY` is set in backend `.env`
   - Ensure key is valid and not expired
   - Test key: go to [Google AI Studio](https://aistudio.google.com) and try API
   - If key doesn't work there, get a new one

2. **Check network connectivity**
   - Can the backend reach `generativelanguage.googleapis.com`?
   - Check firewall/proxy settings
   - Test from backend: `curl https://generativelanguage.googleapis.com`

3. **Check API quota**
   - Email might have exceeded free quota
   - Check [Google Cloud Console](https://console.cloud.google.com)
   - Quotas → Gemini API
   - If exceeded, either wait for reset or upgrade billing

4. **Check model availability**
   - Some models might be deprecated
   - Check available models: Backend should log which models were tried
   - Look in logs for model names attempted

5. **Fallback is working**
   - If AI fails, the system generates basic resume from profile
   - This is normal and the resume is still usable
   - Try again later or contact support if consistent

**Log Entry Examples**:
```
Failed with models/gemini-2.5-flash: [GoogleGenerativeAI Error]: Error fetching...
All models failed for JD analysis, using defaults
=== AI GENERATION FAILED ===
```

**Fix**: 
- Verify API key and quota
- Retry generation after 1 hour
- Use fallback resume if urgent

---

### Problem: Generated resume looks wrong or has formatting issues

**Symptoms**: 
- Content overflows to 2+ pages
- Formatting is broken
- Bullets appear as text blocks

**Solutions**:

1. **Check profile data quality**
   - Ensure bullet points are concise (1-2 lines max)
   - Remove very long descriptions
   - Trim spacing/formatting in profile

2. **Regenerate with revised job description**
   - If JD is too long, try summarizing to 500-1000 words
   - Include only key requirements
   - Regenerate resume

3. **Download as DOCX and edit manually**
   - Download Word format
   - Open in MS Word or Google Docs
   - Manually adjust spacing/layout
   - Re-download as PDF

4. **Check browser scaling**
   - Zoom level should be 100%
   - In preview, zoom in/out to verify layout

---

### Problem: ATS score is very low

**Symptoms**: Score is 20-30 despite good resume

**Solutions**:

1. **Review missing keywords**
   - Keyword analysis shows which keywords are absent
   - Add those keywords to your profile
   - Regenerate resume

2. **Check skill matching**
   - List required/preferred skills from job posting
   - Add them to your "Skills" section
   - Regenerate resume

3. **Improve experience descriptions**
   - Add quantifiable metrics (e.g., "Increased by X%")
   - Include technology names and tools used
   - Regenerate resume

4. **Try different resumes**
   - Generate multiple versions with slight variations
   - Compare scores
   - Use the best-performing version

**Example Improvement**:
```
❌ Bad: "Worked on backend systems"
✅ Good: "Architected microservices using Node.js and PostgreSQL, reducing API latency by 40%"
```

---

## Export & Download Issues

### Problem: PDF download is empty or corrupted

**Symptoms**: 
- Downloaded PDF won't open
- PDF opens but is blank or has garbled text

**Solutions**:

1. **Try downloading again**
   - Sometimes temporary network issues cause corruption
   - Close browser and try again

2. **Try DOCX format**
   - If PDF fails, download as DOCX
   - Open in Word, then export as PDF manually

3. **Use different browser**
   - Try Chrome, Firefox, or Safari
   - Some browsers have better PDF handling

4. **Check resume preview**
   - Does the preview look correct?
   - If preview is broken, regenerate resume first

5. **Clear browser cache**
   - Ctrl+Shift+Delete
   - Delete all browsing data
   - Try download again

---

### Problem: DOCX export opens with formatting issues in Word

**Symptoms**: 
- Formatting broken when opened in Word
- Bullets appear as shapes
- Fonts don't render correctly

**Solutions**:

1. **Use Google Docs alternative**
   - Upload DOCX to Google Drive
   - Open with Google Docs
   - Download PDF from Google Docs

2. **Open in Google Docs in browser first**
   - Better cross-platform compatibility
   - Clean up formatting if needed
   - Export to PDF

3. **Check Word version**
   - Use Word 2016 or newer
   - Older versions have limited .docx support

4. **Try LibreOffice**
   - Free alternative: [LibreOffice](https://www.libreoffice.org/)
   - Often better DOCX compatibility

---

### Problem: File size is too large

**Symptoms**: 
- Downloaded file is > 10MB
- Upload fails when sending resume

**Solutions**:

1. **LinkedIn/job platforms typically accept**:
   - PDF: up to 5-10MB
   - DOCX: up to 2-5MB

2. **Compress PDF**:
   - Use online tool: [tinypng.com](https://tinypdf.com)
   - Or use Adobe Acrobat to compress

3. **Reduce image content**:
   - Resume should be text-based, not image-heavy
   - If you added images, remove them

---

## Frontend Issues

### Problem: UI is broken, buttons don't work, or page is blank

**Symptoms**: 
- Buttons unresponsive
- Layout broken
- Page shows only white screen

**Solutions**:

1. **Hard refresh browser**
   - Ctrl+Shift+R (Windows)
   - Cmd+Shift+R (Mac)
   - This clears cache and reloads

2. **Clear browser cache**
   - DevTools → Application → Clear storage → Clear all
   - Refresh page

3. **Disable browser extensions**
   - Some extensions interfere with React/Vite
   - Try incognito mode (Ctrl+Shift+N)

4. **Check browser console for errors**
   - F12 → Console tab
   - Look for red error messages
   - Screenshot and share with support

5. **Try different browser**
   - Supported: Chrome, Firefox, Safari, Edge
   - Try another browser to isolate issue

---

### Problem: Slow page load or app is laggy

**Symptoms**: 
- Page takes 10+ seconds to load
- Typing is delayed
- Buttons lag

**Solutions**:

1. **Check internet speed**
   - Test at [speedtest.net](https://speedtest.net)
   - Should have at least 5 Mbps download

2. **Check browser performance**
   - DevTools → Performance tab
   - Record page load
   - Identify slow components

3. **Close other tabs**
   - Other tabs consume browser memory
   - Close unnecessary tabs

4. **Restart browser**
   - Close all windows
   - Reopen and try again

5. **Check server status**
   - Backend might be slow
   - Contact support if consistently slow

---

### Problem: Mobile version doesn't display correctly

**Symptoms**: 
- Layout broken on phone/tablet
- Buttons too small
- Can't scroll properly

**Solutions**:

1. **Check viewport settings**
   - Browser zoom should be 100%
   - Settings → Zoom → Reset to 100%

2. **Rotate device**
   - Try landscape vs portrait
   - App should be responsive to both

3. **Update browser**
   - Old mobile browsers may not support features
   - Update to latest version

4. **Clear mobile cache**
   - Settings → Apps → [Browser] → Storage → Clear Cache
   - Refresh page

---

## Backend & Server Issues

### Problem: Backend won't start ("EADDRINUSE" or port already in use)

**Symptoms**: 
```
Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
```

**Solutions**:

1. **Find process using port 3000**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -i :3000
   kill -9 <PID>
   ```

2. **Use different port**
   ```bash
   PORT=3001 npm run dev
   ```

3. **Restart your machine**
   - Sometimes processes don't release ports
   - Full restart clears the issue

---

### Problem: Backend starts but API returns 500 errors

**Symptoms**: 
```
Response: {"error":"Internal Server Error","statusCode":500}
```

**Solutions**:

1. **Check backend logs**
   - Look for red error messages in terminal
   - Screenshot full error stack trace

2. **Verify environment variables**
   - `DATABASE_URL` must be valid
   - `JWT_SECRET` must be set
   - `GEMINI_API_KEY` must be set (for AI features)
   - Check `.env` file

3. **Test database connectivity**
   - Can backend connect to PostgreSQL?
   - Try: `psql $DATABASE_URL -c "SELECT 1"`
   - If fails, database is unreachable

4. **Check logs in database**
   - Look for migration errors
   - Run migrations: `npx prisma migrate deploy`

---

### Problem: Health check fails (GET /health returns error)

**Symptoms**: 
```
curl http://localhost:3000/health
Connection refused or Timeout
```

**Solutions**:

1. **Verify backend is running**
   - Check terminal for "🚀 Resume Builder API Server"
   - If not present, backend isn't running

2. **Check port binding**
   - Is server listening on 0.0.0.0:3000?
   - Try: `curl http://127.0.0.1:3000/health`

3. **Check firewall**
   - Firewall might block port 3000
   - Windows Firewall: Allow Node.js through
   - Linux: `sudo ufw allow 3000`

---

### Problem: Rate limiting blocking requests (429 Too Many Requests)

**Symptoms**: 
```
Response: {"error":"Rate limit exceeded","statusCode":429}
```

**Solutions**:

1. **Wait for rate limit window to pass**
   - Default: 120 requests per 1 minute
   - Wait 1 minute before retrying

2. **Increase rate limit for development**
   - In `.env`: 
   ```
   RATE_LIMIT_MAX=1000
   RATE_LIMIT_WINDOW=1 minute
   ```
   - Restart backend

3. **Implement backoff in client**
   - Don't hammer the API
   - Add delays between requests

---

## Database Issues

### Problem: "Database connection error" or "ECONNREFUSED"

**Symptoms**: 
```
Error: ECONNREFUSED 127.0.0.1:5432
```

**Solutions**:

1. **Verify PostgreSQL is running**
   ```bash
   # Windows
   net start postgresql
   
   # Mac
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   ```

2. **Check DATABASE_URL**
   - Format: `postgresql://user:password@host:port/database`
   - Example: `postgresql://resume_builder:secure_pw@localhost:5432/resume_builder`
   - Verify all parts are correct

3. **Check credentials**
   - Username and password correct?
   - Try connecting manually:
   ```bash
   psql postgresql://user:password@localhost:5432/database
   ```

4. **Check firewall**
   - If database is remote, firewall might block port 5432
   - Check with: `telnet host 5432`

---

### Problem: Migrations fail ("Prisma migrate error")

**Symptoms**: 
```
Error: Direct execution of query 'CREATE...' against '...' failed
```

**Solutions**:

1. **View migration status**
   ```bash
   npx prisma migrate status
   ```

2. **See which migrations failed**
   ```bash
   npx prisma migrate deploy
   ```

3. **Reset database (development only)**
   ```bash
   npx prisma migrate reset
   ```
   - ⚠️ Deletes all data, use only in development

4. **Verify schema**
   - Check [resume-builder/backend/prisma/schema.prisma](resume-builder/backend/prisma/schema.prisma)
   - Ensure it matches your database

---

## Performance Issues

### Problem: Resume generation takes > 10 seconds

**Symptoms**: 
- AI generation hangs for a long time
- Timeout errors

**Solutions**:

1. **Check API performance**
   - Gemini API might be slow or rate-limited
   - Try again after 1 minute

2. **Use simpler job descriptions**
   - Very long JDs can slow generation
   - Try with 500-1000 word summary

3. **Check backend resources**
   - CPU/Memory usage high?
   - `top` (Mac/Linux) or Task Manager (Windows)
   - Restart backend if needed

---

### Problem: Large file upload fails

**Symptoms**: 
- Upload hangs and times out
- "File too large" error

**Solutions**:

1. **Check file size limit**
   - Maximum: 5MB
   - Check file size before uploading
   - Reduce if needed (compress, remove images)

2. **Check network timeout**
   - Slow connections may timeout
   - Try on faster network or mobile hotspot

3. **Check backend timeout**
   - May need to increase in [resume-builder/backend/src/index.ts](resume-builder/backend/src/index.ts)

---

## Deployment Issues

### Problem: Docker build fails

**Symptoms**: 
```
Error: COPY failed: file not found
```

**Solutions**:

1. **Check working directory**
   - Build from project root: `cd cv-maker && docker build .`
   - Not from subdirectories

2. **Verify Dockerfile path**
   - Should be at: `resume-builder/backend/Dockerfile`
   - Check if file exists

3. **Check .dockerignore**
   - Sometimes excludes files needed for build
   - Review and adjust if needed

---

### Problem: Docker container exits immediately

**Symptoms**: 
```
docker ps shows no running containers
docker logs <container> shows error
```

**Solutions**:

1. **Check logs**
   ```bash
   docker logs <container_id>
   ```

2. **Common issues**:
   - Missing environment variables: Set in `docker-compose.yml`
   - Database connection error: Check `DATABASE_URL`
   - Port already in use: Change port in `docker-compose.yml`

3. **Run interactively to debug**
   ```bash
   docker run -it <image_id> /bin/bash
   npm run dev
   ```

---

### Problem: Frontend can't reach backend (CORS error)

**Symptoms**: 
```
Error: Access to XMLHttpRequest blocked by CORS policy
```

**Solutions**:

1. **Set FRONTEND_URL correctly**
   - Backend env: `FRONTEND_URL=http://localhost:5173` (dev)
   - Production: `FRONTEND_URL=https://your-frontend-domain.com`
   - Restart backend after change

2. **Check CORS configuration**
   - [resume-builder/backend/src/index.ts](resume-builder/backend/src/index.ts) line ~24
   - Should include your frontend domain

3. **Verify frontend API base URL**
   - Frontend `.env`: `VITE_API_BASE_URL=http://localhost:3000/api`
   - Production: `VITE_API_BASE_URL=https://api.your-domain.com/api`

---

## Getting Help

### Before contacting support, gather:

1. **Error message** (full text from logs or console)
2. **Exact steps to reproduce** the issue
3. **Browser & OS** (Chrome on Windows 10, etc.)
4. **Screenshots** of the error (redact sensitive data)
5. **Timestamp** when issue occurred
6. **Backend & frontend logs** (last 50 lines)

### Support Channels:

- **GitHub Issues**: [github.com/voidomin/Resume-Forge/issues](https://github.com/voidomin/Resume-Forge/issues)
- **Email** (when available): support@resumeforge.com
- **Documentation**: [docs/](https://github.com/voidomin/Resume-Forge/tree/main/docs)

---

## Quick Reference

### Common Commands

```bash
# Backend
cd resume-builder/backend
npm install           # Install dependencies
npm run dev          # Start development server
npm test             # Run tests
npm run build        # Build for production
npx prisma studio   # Open database GUI

# Frontend
cd resume-builder/frontend
npm install          # Install dependencies
npm run dev         # Start dev server
npm run build       # Build for production
npm test            # Run tests

# Docker
docker-compose build     # Build services
docker-compose up        # Start services
docker-compose down      # Stop services
docker-compose logs -f   # View logs
```

### Useful URLs (Local)

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Health: http://localhost:3000/health
- API Docs: http://localhost:3000/documentation
- Database UI: http://localhost:5555 (Prisma Studio)

---

**Last Updated**: February 11, 2026
**Version**: 1.0.0
