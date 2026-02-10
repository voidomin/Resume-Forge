# Deployment Guide - Resume Builder v1.0

## Prerequisites

- Node.js v20 or higher
- Docker & Docker Compose (for containerized deployment)
- PostgreSQL 16+ (or use Docker version)
- Gemini API Key from [Google AI Studio](https://aistudio.google.com)
- Environment variables configured

## Environment Setup

### 1. Create `.env` file from template

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Frontend
VITE_API_BASE_URL=https://your-domain.com/api

# Database
DATABASE_URL=postgresql://user:password@your-db-host:5432/resume_builder

# Security
JWT_SECRET=$(openssl rand -hex 32)  # Generate a strong secret

# AI Service
GEMINI_API_KEY=your-actual-api-key
```

### 2. Database Setup

```bash
# Create database schema
cd resume-builder/backend
npx prisma migrate deploy

# Seed test data (optional)
npx prisma db seed
```

## Deployment Options

### Option A: Docker Compose (Recommended for Quick Start)

```bash
# Build and start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# View logs
docker-compose logs -f backend
```

### Option B: Manual Deployment (VPS/Dedicated Server)

#### Backend Setup

```bash
cd resume-builder/backend

# Install dependencies
npm ci --only=production

# Build TypeScript
npm run build

# Run migrations
DATABASE_URL=... npx prisma migrate deploy

# Start server
NODE_ENV=production npm start
```

#### Frontend Deployment

**Option B1: Static Build (Recommended)**

```bash
cd resume-builder/frontend

# Build the application
npm run build

# Deploy `dist/` folder to any static hosting:
# - Vercel: `vercel deploy`
# - Netlify: drag & drop `dist/` folder
# - AWS S3: `aws s3 sync dist/ s3://your-bucket`
```

**Option B2: Server-Side Rendering**

```bash
npm run preview  # Test production build locally
# Then deploy to your Node.js server
```

### Option C: Cloud Platform Specific

#### Vercel + Railway

```bash
# Frontend: Deploy to Vercel
# - Connect GitHub repo: https://vercel.com/new
# - Set VITE_API_BASE_URL environment variable

# Backend: Deploy to Railway
# - Connect GitHub repo: https://railway.app
# - Add PostgreSQL service
# - Set environment variables in Railway dashboard
```

#### Heroku (Legacy - Not Recommended)

```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create your-resume-builder

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set GEMINI_API_KEY=your-key

# Deploy
git push heroku main
```

## Production Checklist

Before going live, ensure:

### Security
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] Database password is strong
- [ ] CORS is restricted to your frontend domain
- [ ] HTTPS is enabled
- [ ] Rate limiting is configured for API
- [ ] Input validation is active
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS protection (React handles this)

### Performance
- [ ] Frontend is minified and bundled
- [ ] Assets have appropriate cache headers
- [ ] Database indexes are created
- [ ] Connection pooling configured for DB
- [ ] CDN is set up (optional but recommended)

### Monitoring
- [ ] Error tracking configured (Sentry recommended)
- [ ] Application logs are centralized
- [ ] Database backups are automated
- [ ] Health check endpoints are configured
- [ ] Uptime monitoring is active

### Testing
- [ ] E2E tests pass
- [ ] Manual smoke testing completed
- [ ] Different user flows tested
- [ ] Export (PDF/DOCX) validated
- [ ] Fallback AI model tested

### Documentation
- [ ] API documentation updated
- [ ] Runbooks created for common issues
- [ ] Incident response plan drafted
- [ ] Team trained on deployment process

## Health Checks

### Backend Health Endpoint

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-02-10T12:00:00Z",
  "uptime": 3600,
  "database": "connected"
}
```

### Frontend Health Check

Visit: `https://your-domain.com/`
- Page loads without errors
- API connectivity is established
- Resume generation works

## Troubleshooting

### Database Connection Failed

```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Verify connection:
psql $DATABASE_URL -c "SELECT 1"
```

### Gemini API Rate Limiting

The system automatically falls back to basic template if Gemini fails. To increase quotas:
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Check API usage and quota limits
3. Request quota increase if hitting limits

### High Memory Usage

Check running processes and optimize:

```bash
# Monitor Node process
ps aux | grep node

# Check for memory leaks in logs
docker logs resume_builder_api | grep -i memory
```

## Rolling Back

```bash
# If using Docker
docker-compose down
git checkout previous-commit
docker-compose up -d

# If using manual deployment
git checkout previous-commit
npm run build
npm restart resume-builder-api
```

## Monitoring & Alerts

### Key Metrics to Monitor

1. **API Response Time**: Should be < 200ms
2. **Resume Generation Time**: Should be < 5s
3. **Database Connection Pool**: Utilization < 80%
4. **Gemini API Costs**: Monitor monthly spend
5. **Error Rate**: Should be < 0.1%

### Set Up Alerts

Use your hosting provider's monitoring:
- Vercel for frontend
- Railway/Render dashboard for backend
- Database metrics from PostgreSQL

## Support & Help

For issues:
1. Check logs: `docker-compose logs -f`
2. Review GitHub Issues
3. Check DEPLOYMENT.md troubleshooting section
4. Open a GitHub issue for bugs

---

**Version**: 1.0.0
**Last Updated**: February 2024
