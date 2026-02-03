# Getting Started with Resume Builder Development

## 🚀 Quick Start Guide

This guide will help you set up and start developing your ATS-optimized resume builder from scratch.

---

## Prerequisites Checklist ✅

You have:
- ✅ Node.js v22.21.0
- ✅ npm v10.9.4
- ✅ Python 3.12.3

---

## Phase 1: Project Setup (Day 1)

### Step 1: Initialize the Project Structure

```bash
# Create main project directory
mkdir resume-builder
cd resume-builder

# Initialize Git repository
git init

# Create basic structure
mkdir -p frontend backend shared/types docs

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Environment variables
.env
.env.local
.env.*.local

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor directories
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Misc
.cache/
temp/
EOF
```

### Step 2: Set Up Frontend (React + TypeScript + Vite)

```bash
# Navigate to frontend directory
cd frontend

# Initialize Vite project with React + TypeScript
npm create vite@latest . -- --template react-ts

# Install core dependencies
npm install

# Install routing
npm install react-router-dom

# Install state management
npm install zustand

# Install form handling
npm install react-hook-form zod @hookform/resolvers

# Install UI framework
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install additional utilities
npm install axios date-fns lucide-react

# Install dev dependencies
npm install -D @types/node
```

### Step 3: Configure Tailwind CSS

```bash
# frontend/tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Add Tailwind directives to CSS
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50;
  }
}
EOF
```

### Step 4: Set Up Backend (Node.js + TypeScript + Fastify)

```bash
# Navigate to backend directory
cd ../backend

# Initialize npm
npm init -y

# Install core dependencies
npm install fastify @fastify/cors @fastify/jwt @fastify/multipart
npm install dotenv bcrypt jsonwebtoken

# Install Prisma (ORM)
npm install prisma @prisma/client

# Install document generation
npm install pdfkit docx

# Install NLP for keyword extraction
npm install natural

# Install TypeScript and types
npm install -D typescript @types/node @types/bcrypt @types/jsonwebtoken
npm install -D ts-node ts-node-dev

# Install development tools
npm install -D prisma nodemon

# Initialize TypeScript
npx tsc --init

# Initialize Prisma
npx prisma init
```

### Step 5: Configure TypeScript for Backend

```bash
# backend/tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

### Step 6: Set Up Database Schema

```bash
# backend/prisma/schema.prisma
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  profile   Profile?
  resumes   Resume[]
}

model Profile {
  id             String          @id @default(uuid())
  userId         String          @unique
  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  personalInfo   Json
  summary        String?
  experiences    Experience[]
  education      Education[]
  skills         Skill[]
  certifications Certification[]
  projects       Project[]
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
}

model Experience {
  id               String   @id @default(uuid())
  profileId        String
  profile          Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  company          String
  role             String
  location         String?
  startDate        DateTime
  endDate          DateTime?
  current          Boolean  @default(false)
  responsibilities Json
  achievements     Json?
  keywords         Json?
  domains          Json?
  alwaysInclude    Boolean  @default(false)
  exclude          Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model Education {
  id                 String   @id @default(uuid())
  profileId          String
  profile            Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  institution        String
  degree             String
  field              String
  location           String?
  startDate          DateTime
  endDate            DateTime?
  gpa                Float?
  relevantCoursework Json?
  achievements       Json?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model Skill {
  id                String   @id @default(uuid())
  profileId         String
  profile           Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  name              String
  category          String
  proficiency       String?
  yearsOfExperience Int?
  keywords          Json?
  createdAt         DateTime @default(now())
}

model Certification {
  id           String   @id @default(uuid())
  profileId    String
  profile      Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  name         String
  issuer       String
  issueDate    DateTime
  expiryDate   DateTime?
  credentialId String?
  createdAt    DateTime @default(now())
}

model Project {
  id          String   @id @default(uuid())
  profileId   String
  profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  name        String
  description String
  technologies Json
  link        String?
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime @default(now())
}

model Resume {
  id                String   @id @default(uuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name              String
  jobDescription    String?
  extractedKeywords Json?
  targetRole        String?
  selectedContent   Json
  customizations    Json?
  atsScore          Float?
  format            String   @default("chronological")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  lastDownloaded    DateTime?
}
EOF
```

### Step 7: Create Environment Files

```bash
# backend/.env
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/resume_builder?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"

# Server
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"
EOF

# frontend/.env
cd ../frontend
cat > .env << 'EOF'
VITE_API_URL=http://localhost:3000/api
EOF
```

---

## Phase 2: Create Basic Project Structure

### Frontend Structure

```bash
cd frontend/src

# Create directory structure
mkdir -p components/{common,Profile,Resume,Auth,Editor}
mkdir -p pages
mkdir -p hooks
mkdir -p store
mkdir -p utils
mkdir -p types
mkdir -p api

# Create placeholder files
touch components/common/Header.tsx
touch components/common/Footer.tsx
touch components/common/Button.tsx
touch pages/Dashboard.tsx
touch pages/Login.tsx
touch pages/Register.tsx
touch pages/ProfileEdit.tsx
touch pages/ResumeGenerator.tsx
touch store/authStore.ts
touch store/profileStore.ts
touch api/client.ts
touch types/index.ts
```

### Backend Structure

```bash
cd ../../backend/src

# Create directory structure
mkdir -p routes
mkdir -p controllers
mkdir -p services/{matching,generation,ats}
mkdir -p middleware
mkdir -p utils
mkdir -p types

# Create placeholder files
touch routes/auth.routes.ts
touch routes/profile.routes.ts
touch routes/resume.routes.ts
touch controllers/auth.controller.ts
touch controllers/profile.controller.ts
touch controllers/resume.controller.ts
touch services/matching/matcher.service.ts
touch services/generation/pdf.service.ts
touch services/generation/docx.service.ts
touch services/ats/validator.service.ts
touch middleware/auth.middleware.ts
touch utils/logger.ts
touch types/index.ts
touch index.ts
```

---

## Phase 3: Development Workflow

### Backend Development

```bash
# Add scripts to package.json
cd ../backend
npm pkg set scripts.dev="ts-node-dev --respawn --transpile-only src/index.ts"
npm pkg set scripts.build="tsc"
npm pkg set scripts.start="node dist/index.js"
npm pkg set scripts.prisma:generate="prisma generate"
npm pkg set scripts.prisma:migrate="prisma migrate dev"
npm pkg set scripts.prisma:studio="prisma studio"

# Generate Prisma client
npm run prisma:generate

# Run migrations (after setting up database)
# npm run prisma:migrate
```

### Frontend Development

```bash
cd ../frontend

# Scripts are already set by Vite
# npm run dev - Start development server
# npm run build - Build for production
# npm run preview - Preview production build
```

---

## Phase 4: Set Up Database

### Option 1: Local PostgreSQL (Development)

```bash
# Install PostgreSQL (if not already installed)
# On macOS:
brew install postgresql@15

# On Ubuntu/Debian:
sudo apt-get install postgresql-15

# Start PostgreSQL service
# On macOS:
brew services start postgresql@15

# On Ubuntu:
sudo systemctl start postgresql

# Create database
createdb resume_builder

# Update DATABASE_URL in backend/.env
DATABASE_URL="postgresql://username@localhost:5432/resume_builder?schema=public"
```

### Option 2: Supabase (Cloud - Recommended)

1. Go to https://supabase.com
2. Create a free account
3. Create a new project
4. Copy the database connection string
5. Update `backend/.env` with the connection string

```bash
# Run migrations
cd backend
npm run prisma:migrate
```

---

## Phase 5: Start Development

### Terminal 1: Backend Server

```bash
cd backend
npm run dev
# Server will run on http://localhost:3000
```

### Terminal 2: Frontend Server

```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:5173
```

### Terminal 3: Prisma Studio (Optional - Database GUI)

```bash
cd backend
npm run prisma:studio
# Opens at http://localhost:5555
```

---

## Development Checklist

### Week 1: Foundation
- [ ] Set up project structure
- [ ] Configure database
- [ ] Implement authentication (register, login, JWT)
- [ ] Create basic UI layout (Header, Footer, Navigation)

### Week 2-3: Profile Management
- [ ] Build Profile form UI
- [ ] Implement Profile CRUD API
- [ ] Add Experience management
- [ ] Add Education management
- [ ] Add Skills management

### Week 4-5: Resume Generation
- [ ] Build job description input UI
- [ ] Implement matching algorithm
- [ ] Create resume preview
- [ ] Add edit functionality

### Week 6: Document Generation
- [ ] Implement PDF generation
- [ ] Implement DOCX generation
- [ ] Add ATS validation
- [ ] Create download functionality

### Week 7: Polish
- [ ] Add error handling
- [ ] Implement loading states
- [ ] Add validation messages
- [ ] Improve UI/UX

### Week 8: Testing & Deployment
- [ ] Write tests
- [ ] Set up CI/CD
- [ ] Deploy to production
- [ ] Documentation

---

## Useful Commands Reference

### Backend
```bash
# Start development server
npm run dev

# Generate Prisma client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Build for production
npm run build

# Start production server
npm start
```

### Frontend
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Git
```bash
# Initial commit
git add .
git commit -m "Initial project setup"

# Create feature branch
git checkout -b feature/authentication

# Commit changes
git add .
git commit -m "Implement user authentication"

# Merge to main
git checkout main
git merge feature/authentication
```

---

## Next Steps

1. **Set up your database** (Supabase recommended for easy start)
2. **Run the backend** and test the server starts
3. **Run the frontend** and see the Vite welcome page
4. **Start with authentication** - it's the foundation
5. **Build incrementally** - one feature at a time

---

## Helpful Resources

- **React Docs**: https://react.dev
- **Fastify Docs**: https://fastify.dev
- **Prisma Docs**: https://prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com
- **Supabase**: https://supabase.com/docs

---

## Troubleshooting

### "Module not found" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Prisma client errors
```bash
# Regenerate Prisma client
npm run prisma:generate
```

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in backend/.env
PORT=3001
```

### CORS errors
Check that `FRONTEND_URL` in backend/.env matches your frontend URL

---

## Ready to Code! 🎉

You now have everything you need to start building your resume builder. Start with the authentication system and work your way up!

Good luck! 🚀
