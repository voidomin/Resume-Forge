# Tech Stack Recommendation

## ATS-Optimized Role-Based Resume Builder

---

## Overview

This document outlines the recommended technology stack for building a personal ATS-optimized resume builder. The stack is chosen to balance functionality, development speed, cost-effectiveness, and maintainability for a personal project.

---

## 1. Frontend Stack

### 1.1 Core Framework: **React 18+**

**Why React:**

- Large ecosystem and community support
- Component reusability for profile and resume sections
- Rich library ecosystem for document generation
- Easy integration with modern tooling
- Excellent performance with Virtual DOM

**Alternatives Considered:**

- Vue.js: Simpler learning curve but smaller ecosystem
- Svelte: Better performance but fewer libraries
- Angular: Over-engineered for this use case

### 1.2 UI Framework: **Tailwind CSS**

**Why Tailwind:**

- Rapid UI development with utility classes
- Highly customizable
- Small bundle size with PurgeCSS
- Excellent documentation
- No opinionated components (full design control)

**Component Library (Optional):** Shadcn/ui or Headless UI

- Pre-built accessible components
- Customizable with Tailwind
- Reduces development time

**Alternatives Considered:**

- Material-UI: Too heavy, opinionated design
- Bootstrap: Less modern, harder to customize
- Plain CSS: More time-consuming

### 1.3 State Management: **Zustand** or **React Context + useReducer**

**Why Zustand:**

- Lightweight (1KB)
- Simple API, minimal boilerplate
- Built-in persistence
- Perfect for small to medium apps

**When to use Context:**

- If state management needs are minimal
- Avoiding external dependencies

**Alternatives Considered:**

- Redux: Overkill for this project
- Recoil: More complex than needed
- MobX: Smaller ecosystem

### 1.4 Form Management: **React Hook Form**

**Why React Hook Form:**

- Excellent performance (uncontrolled components)
- Built-in validation
- Minimal re-renders
- Easy integration with UI libraries
- TypeScript support

**Validation:** Zod or Yup

- Type-safe schema validation
- Reusable validation schemas
- Great error handling

### 1.5 Build Tool: **Vite**

**Why Vite:**

- Lightning-fast development server
- Optimized production builds
- Modern ES modules
- Excellent DX (Developer Experience)
- React Fast Refresh out of the box

**Alternatives Considered:**

- Create React App: Slower, less flexible
- Webpack: More configuration required

### 1.6 Routing: **React Router v6**

**Why React Router:**

- Industry standard for React
- Declarative routing
- Nested routes support
- Good TypeScript support

---

## 2. Backend Stack

### 2.1 Runtime: **Node.js 20+ LTS**

**Why Node.js:**

- JavaScript/TypeScript throughout the stack
- Large ecosystem (npm)
- Excellent async I/O for document generation
- Good performance for this use case

### 2.2 Framework: **Express.js** or **Fastify**

**Recommended: Fastify**

**Why Fastify:**

- 2x faster than Express
- Built-in schema validation
- First-class TypeScript support
- Modern async/await patterns
- Excellent plugin ecosystem

**Why Express (Alternative):**

- More mature, larger community
- More middleware options
- Simpler learning curve
- Adequate performance

### 2.3 Language: **TypeScript**

**Why TypeScript:**

- Type safety reduces bugs
- Better IDE support and autocomplete
- Easier refactoring
- Self-documenting code
- Industry standard for modern Node.js

**Configuration:**

- Strict mode enabled
- Path aliases for cleaner imports
- Shared types between frontend/backend

### 2.4 API Design: **REST API** (for simplicity)

**Endpoints:**

```
/api/auth/*          - Authentication
/api/profile/*       - Profile management
/api/resumes/*       - Resume CRUD
/api/generate/*      - Resume generation
```

**Alternative Considered:**

- GraphQL: Overkill for this project's scope
- tRPC: Great but adds complexity

### 2.5 Authentication: **JWT + HTTP-only Cookies**

**Libraries:**

- `jsonwebtoken` - JWT creation/verification
- `bcrypt` - Password hashing

**Strategy:**

- Access token (15 min expiry)
- Refresh token (7 days expiry)
- Secure, HTTP-only cookies
- CSRF protection

---

## 3. Database

### 3.1 Primary Database: **PostgreSQL 15+**

**Why PostgreSQL:**

- Robust ACID compliance
- Excellent JSON support (JSONB for flexible schemas)
- Full-text search capabilities
- Strong data integrity
- Free and open-source
- Great performance for relational data

**Hosting Options:**

- **Supabase (Recommended):** Free tier, managed PostgreSQL, built-in auth
- **Railway:** Simple deployment, generous free tier
- **Neon:** Serverless PostgreSQL, great free tier
- **ElephantSQL:** Dedicated PostgreSQL hosting

### 3.2 ORM: **Prisma**

**Why Prisma:**

- Type-safe database queries
- Automatic migrations
- Excellent TypeScript support
- Intuitive schema definition
- Built-in database seeding
- Great developer experience

**Schema Example:**

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  profile   Profile?
  resumes   Resume[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Profile {
  id           String       @id @default(uuid())
  userId       String       @unique
  user         User         @relation(fields: [userId], references: [id])
  personalInfo Json
  experiences  Experience[]
  education    Education[]
  skills       Skill[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}
```

**Alternatives Considered:**

- TypeORM: More complex, less intuitive
- Sequelize: Older, less type-safe
- Drizzle ORM: Newer, less mature ecosystem

### 3.3 Caching (Optional): **Redis**

**Why Redis:**

- Cache frequently accessed profiles
- Session storage
- Rate limiting
- Fast key-value lookups

**When to add:**

- If performance becomes an issue
- For production deployment

**Hosting:**

- Upstash (free tier, serverless)
- Redis Cloud (free tier)

---

## 4. Document Generation

### 4.1 PDF Generation: **PDFKit** or **jsPDF**

**Recommended: PDFKit**

**Why PDFKit:**

- Server-side generation (more reliable)
- Fine control over formatting
- ATS-friendly output
- Lightweight
- Good documentation

**Installation:**

```bash
npm install pdfkit
```

**Alternatives:**

- jsPDF: Client-side, less control
- Puppeteer: Overkill, resource-heavy
- wkhtmltopdf: Deprecated

### 4.2 DOCX Generation: **docx** (by dolanmiu)

**Why docx:**

- Pure JavaScript/TypeScript
- No external dependencies
- Creates .docx files directly
- Good formatting control
- Active maintenance

**Installation:**

```bash
npm install docx
```

**Alternatives:**

- docxtemplater: Template-based, less flexible
- officegen: Older, less maintained

---

## 5. NLP & Text Processing

### 5.1 Keyword Extraction: **natural** or **compromise**

**Recommended: natural**

**Why natural:**

- Comprehensive NLP toolkit
- Tokenization, stemming, TF-IDF
- Works well for job description analysis
- No external API dependencies

**Installation:**

```bash
npm install natural
```

**Alternative: compromise**

- Faster, lighter weight
- Good for simpler NLP tasks

### 5.2 Google Gemini AI (Primary Engine)

**Use Cases:**

- High-fidelity job description analysis
- Role-specific experience selection & tailoring
- Multi-tier model fallback for maximum resilience
- Professional summary and bullet point generation

**Model Selection:**

- **Primary:** Gemini 3 Flash (Highest speed/accuracy ratio)
- **Secondary Fallbacks:** Gemini 2.5 Flash, 1.5 Flash
- **Basic Fallback:** Internal template-driven generation (0 cost)

**Cost Consideration:**

- Gemini often provides generous free tiers for developers.
- Pay-as-you-go pricing is significantly lower than GPT-4 for similar throughput.

---

## 6. File Storage

### 6.1 Cloud Storage: **AWS S3** or **Cloudflare R2**

**Recommended: Cloudflare R2**

**Why R2:**

- S3-compatible API
- No egress fees
- 10GB free storage
- Good performance
- Simple pricing

**What to store:**

- Generated PDF/DOCX files
- User profile exports (optional)

**Alternatives:**

- Supabase Storage: Integrated with Supabase DB
- Vercel Blob: Simple, integrated with Vercel
- Local filesystem: For development only

---

## 7. Deployment & Hosting

### 7.1 Frontend Hosting: **Vercel** or **Netlify**

**Recommended: Vercel**

**Why Vercel:**

- Optimized for React/Next.js
- Automatic HTTPS
- Global CDN
- Generous free tier
- Excellent DX
- Preview deployments

**Free Tier Limits:**

- 100GB bandwidth/month
- Unlimited sites
- Serverless functions

**Alternatives:**

- Netlify: Similar features, good alternative
- Cloudflare Pages: Great performance, newer

### 7.2 Backend Hosting: **Railway** or **Render**

**Recommended: Railway**

**Why Railway:**

- Simple deployment from GitHub
- Built-in PostgreSQL
- Environment variables management
- Good free tier ($5 credit/month)
- Easy scaling
- Great developer experience

**Free Tier:**

- 500 hours/month
- $5 credit (covers basic usage)
- Auto-sleep after inactivity

**Alternatives:**

- Render: More generous free tier but slower cold starts
- Fly.io: Good performance, more complex setup
- Heroku: More expensive, less generous free tier

### 7.3 Database Hosting: **Supabase** or **Neon**

**Recommended: Supabase**

**Why Supabase:**

- Free PostgreSQL database (500MB)
- Built-in authentication (bonus!)
- Real-time subscriptions
- Auto-generated REST API
- Dashboard for database management
- File storage included

**Free Tier:**

- 500MB database
- 1GB file storage
- 2GB bandwidth

**Alternative: Neon**

- Serverless PostgreSQL
- Instant branching
- Great for development

### 7.4 CI/CD: **GitHub Actions**

**Why GitHub Actions:**

- Free for public repos
- 2000 min/month for private repos
- Integrated with GitHub
- Easy configuration

**Pipeline:**

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Install dependencies
      - Run tests
      - Build
      - Deploy to Vercel/Railway
```

---

## 8. Development Tools

### 8.1 Code Quality

**Linting:** ESLint + Prettier

```bash
npm install -D eslint prettier eslint-config-prettier
```

**Pre-commit Hooks:** Husky + lint-staged

```bash
npm install -D husky lint-staged
```

**TypeScript Compiler:** tsc with strict mode

### 8.2 Testing

**Unit Testing:** Vitest

- Fast, Vite-native
- Jest-compatible API
- Great TypeScript support

**E2E Testing (Optional):** Playwright

- Cross-browser testing
- Can test PDF/DOCX downloads
- Better than Selenium

**Installation:**

```bash
npm install -D vitest @testing-library/react
npm install -D @playwright/test
```

### 8.3 API Testing

**Development:** Thunder Client (VS Code) or Postman

**Automated:** Supertest

```bash
npm install -D supertest
```

### 8.4 Version Control

**Platform:** GitHub
**Branching Strategy:**

- `main` - production
- `develop` - development
- `feature/*` - features

### 8.5 Development Environment

**Recommended IDE:** VS Code
**Extensions:**

- ESLint
- Prettier
- Prisma
- Thunder Client
- GitLens
- Error Lens

---

## 9. Monitoring & Analytics

### 9.1 Error Tracking: **Sentry**

**Why Sentry:**

- Free tier (5K errors/month)
- Excellent error tracking
- Source maps support
- Performance monitoring

### 9.2 Analytics (Optional): **Plausible** or **Umami**

**Why Plausible:**

- Privacy-friendly
- Lightweight script
- GDPR compliant
- Simple dashboards

**Alternative:** Google Analytics

- More features
- Privacy concerns
- Overkill for personal project

### 9.3 Logging: **Pino**

**Why Pino:**

- Fast JSON logger
- Low overhead
- Good TypeScript support
- Structured logging

---

## 10. Security Tools

### 10.1 Security Headers: **Helmet.js**

```bash
npm install helmet
```

### 10.2 Rate Limiting: **express-rate-limit**

```bash
npm install express-rate-limit
```

### 10.3 Input Validation: **Zod** or **Joi**

**Recommended: Zod**

- TypeScript-first
- Type inference
- Works on frontend and backend

### 10.4 Environment Variables: **dotenv**

```bash
npm install dotenv
```

---

## 11. Recommended Project Structure

```
resume-builder/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Profile/
│   │   │   ├── Resume/
│   │   │   ├── Editor/
│   │   │   └── common/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── api/
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── matching/
│   │   │   ├── generation/
│   │   │   └── ats/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── types/
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
│
├── shared/
│   └── types/
│
└── docs/
    ├── PRD.md
    ├── DESIGN.md
    └── API.md
```

---

## 12. Development Workflow

### Phase 1: Setup (Week 1)

1. Initialize Git repository
2. Set up frontend with Vite + React
3. Set up backend with Node.js + Express/Fastify
4. Configure TypeScript
5. Set up PostgreSQL with Prisma
6. Configure ESLint, Prettier, Husky

### Phase 2: Core Features (Weeks 2-4)

1. Implement authentication
2. Build profile management UI and API
3. Create database schema and migrations
4. Implement CRUD operations

### Phase 3: Resume Generation (Weeks 5-7)

1. Build matching algorithm
2. Implement ATS validation
3. Create document generation (PDF/DOCX)
4. Build resume preview UI

### Phase 4: Polish (Week 8)

1. Testing (unit + integration)
2. Bug fixes
3. Performance optimization
4. Documentation

### Phase 5: Deployment (Week 9)

1. Set up CI/CD
2. Deploy to production
3. Configure monitoring
4. Final testing

---

## 13. Cost Estimation (Monthly)

### Free Tier Options:

- **Frontend (Vercel):** $0
- **Backend (Railway):** $0 (with $5 credit)
- **Database (Supabase):** $0
- **Storage (Cloudflare R2):** $0 (10GB free)
- **Monitoring (Sentry):** $0 (5K errors)
- **Total:** **$0/month** for personal use

### If Scaling Beyond Free Tier:

- **Railway Pro:** $20/month
- **Supabase Pro:** $25/month
- **Vercel Pro:** $20/month
- **Total:** ~$65/month (only if needed)

---

## 14. Alternative Stack (Serverless)

If you prefer a fully serverless approach:

**Frontend:** Next.js 14 + App Router
**Backend:** Next.js API Routes or Serverless Functions
**Database:** Supabase or PlanetScale
**Storage:** Vercel Blob or Supabase Storage
**Hosting:** Vercel (everything in one place)

**Pros:**

- Simpler deployment
- Better integration
- Auto-scaling

**Cons:**

- Vendor lock-in
- Less control
- Cold starts

---

## 15. Getting Started Commands

### Initialize Frontend:

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install react-router-dom zustand react-hook-form zod
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Initialize Backend:

```bash
mkdir backend && cd backend
npm init -y
npm install express fastify prisma @prisma/client
npm install bcrypt jsonwebtoken dotenv pdfkit docx natural
npm install -D typescript @types/node @types/express ts-node-dev
npx tsc --init
npx prisma init
```

### Set up Database:

```bash
# Update .env with DATABASE_URL
npx prisma migrate dev --name init
npx prisma generate
```

---

## 16. Recommended Learning Resources

### React & TypeScript:

- React docs (react.dev)
- TypeScript Handbook
- Vite Guide

### Backend:

- Node.js Best Practices (goldbergyoni/nodebestpractices)
- Prisma Docs
- Fastify Documentation

### Document Generation:

- PDFKit Guide
- docx Library Documentation

### Deployment:

- Vercel Documentation
- Railway Documentation
- Supabase Documentation

---

## 17. Summary & Recommendations

### Recommended Stack for Quick Start:

**Frontend:**

- React + TypeScript + Vite
- Tailwind CSS
- Zustand
- React Hook Form + Zod

**Backend:**

- Node.js + TypeScript
- Fastify
- Prisma + PostgreSQL
- JWT Authentication

**Document Generation:**

- PDFKit (PDF)
- docx (DOCX)

**AI & NLP:**

- Google Gemini 3 Flash (Primary AI)
- natural (Local keyword supplementary)

**Hosting:**

- Vercel (Frontend)
- Railway (Backend)
- Supabase (Database)

**Total Cost:** $0/month (free tiers)

This stack provides:

- ✅ Fast development
- ✅ Type safety
- ✅ Great DX
- ✅ Scalability
- ✅ Zero cost for personal use
- ✅ Modern best practices

---

## 18. Next Steps

1. **Review** this tech stack and make decisions
2. **Set up** development environment
3. **Initialize** Git repository
4. **Create** basic project structure
5. **Start** with authentication and profile management
6. **Build** iteratively following the development workflow
7. **Deploy** early and often
8. **Test** with real job descriptions
9. **Iterate** based on results

Good luck building your resume builder! 🚀
