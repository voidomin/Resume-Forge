# Starter Code Files - Placement Guide

This document shows you where to place each of the starter code files I've created.

## 📂 Project Structure Overview

```
resume-builder/
├── frontend/
│   ├── src/
│   │   ├── App.tsx                    → frontend_App.tsx
│   │   ├── store/
│   │   │   └── authStore.ts           → frontend_authStore.ts
│   │   ├── pages/
│   │   │   ├── Login.tsx              → frontend_Login.tsx
│   │   │   ├── Register.tsx           → frontend_Register.tsx
│   │   │   ├── Dashboard.tsx          → frontend_Dashboard.tsx
│   │   │   ├── ProfileEdit.tsx        → from frontend_PlaceholderPages.tsx
│   │   │   └── ResumeGenerator.tsx    → from frontend_PlaceholderPages.tsx
│   │   └── components/
│   │       └── common/
│   │           ├── Header.tsx         → frontend_Header.tsx
│   │           └── Footer.tsx         → frontend_Footer.tsx
│   └── package.json
│
└── backend/
    └── src/
        ├── index.ts                    → backend_index.ts
        ├── routes/
        │   ├── auth.routes.ts          → backend_auth_routes.ts
        │   ├── profile.routes.ts       → backend_profile_routes.ts
        │   └── resume.routes.ts        → backend_resume_routes.ts
        ├── controllers/
        │   └── auth.controller.ts      → backend_auth_controller.ts
        └── middleware/
            └── auth.middleware.ts      → backend_auth_middleware.ts
```

## 🚀 Quick Start Options

### Option 1: Automated Setup (Recommended)

Run the setup script to create the entire project structure:

```bash
# Make the script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

This will:
- Create the complete project structure
- Install all dependencies
- Set up configuration files
- Initialize Git repository

After running the script, you'll need to:
1. Copy the starter code files to their respective locations (see below)
2. Set up your database (Supabase recommended)
3. Run migrations
4. Start the servers

### Option 2: Manual Setup

Follow the detailed instructions in `GETTING_STARTED.md`

## 📋 File Placement Instructions

After running the setup script or creating the project structure manually, copy these files:

### Backend Files

```bash
# Main server file
cp backend_index.ts resume-builder/backend/src/index.ts

# Routes
cp backend_auth_routes.ts resume-builder/backend/src/routes/auth.routes.ts
cp backend_profile_routes.ts resume-builder/backend/src/routes/profile.routes.ts
cp backend_resume_routes.ts resume-builder/backend/src/routes/resume.routes.ts

# Controllers
cp backend_auth_controller.ts resume-builder/backend/src/controllers/auth.controller.ts

# Middleware
cp backend_auth_middleware.ts resume-builder/backend/src/middleware/auth.middleware.ts
```

### Frontend Files

```bash
# Main app component
cp frontend_App.tsx resume-builder/frontend/src/App.tsx

# Store
cp frontend_authStore.ts resume-builder/frontend/src/store/authStore.ts

# Pages
cp frontend_Login.tsx resume-builder/frontend/src/pages/Login.tsx
cp frontend_Register.tsx resume-builder/frontend/src/pages/Register.tsx
cp frontend_Dashboard.tsx resume-builder/frontend/src/pages/Dashboard.tsx

# Extract ProfileEdit and ResumeGenerator from frontend_PlaceholderPages.tsx
# and place them as:
# - resume-builder/frontend/src/pages/ProfileEdit.tsx
# - resume-builder/frontend/src/pages/ResumeGenerator.tsx

# Common components
cp frontend_Header.tsx resume-builder/frontend/src/components/common/Header.tsx
cp frontend_Footer.tsx resume-builder/frontend/src/components/common/Footer.tsx
```

## 🗄️ Database Setup

### Using Supabase (Recommended - Free Tier)

1. Go to https://supabase.com
2. Create a free account
3. Create a new project
4. Go to Settings → Database
5. Copy the connection string
6. Update `backend/.env`:
   ```
   DATABASE_URL="postgresql://[YOUR_CONNECTION_STRING]"
   ```

### Using Local PostgreSQL

1. Install PostgreSQL
2. Create database:
   ```bash
   createdb resume_builder
   ```
3. Update `backend/.env`:
   ```
   DATABASE_URL="postgresql://username@localhost:5432/resume_builder?schema=public"
   ```

## 🔧 Initial Configuration

### 1. Install Dependencies

```bash
# Frontend
cd resume-builder/frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Set Up Prisma Schema

The Prisma schema is already provided in the setup script. It's located at:
`resume-builder/backend/prisma/schema.prisma`

### 3. Run Migrations

```bash
cd resume-builder/backend
npm run prisma:migrate
```

This will create all the necessary database tables.

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

## ▶️ Running the Application

### Start Backend (Terminal 1)

```bash
cd resume-builder/backend
npm run dev
```

The backend will start on: http://localhost:3000

### Start Frontend (Terminal 2)

```bash
cd resume-builder/frontend
npm run dev
```

The frontend will start on: http://localhost:5173

## 🧪 Testing the Setup

1. Open http://localhost:5173 in your browser
2. Click "Sign Up" to create an account
3. Enter email and password
4. You should be redirected to the dashboard
5. Backend API should be accessible at http://localhost:3000

## 📚 Additional Resources

- **Getting Started Guide**: `GETTING_STARTED.md` - Detailed development guide
- **PRD**: `PRD_Resume_Builder.md` - Product requirements
- **Design Doc**: `Design_Document_Resume_Builder.md` - System architecture
- **Tech Stack**: `Tech_Stack_Resume_Builder.md` - Technology decisions

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
cd backend
npm run prisma:generate
npm install
```

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in backend/.env
PORT=3001
```

### CORS errors
Make sure `FRONTEND_URL` in `backend/.env` matches your frontend URL

### Database connection errors
1. Check your DATABASE_URL is correct
2. Ensure PostgreSQL is running
3. Check firewall settings
4. For Supabase, verify connection pooling settings

## 📝 Next Steps After Setup

1. ✅ Test authentication (register/login)
2. 📝 Implement profile management
3. 🎯 Build resume generation logic
4. 📄 Add PDF/DOCX export
5. 🚀 Deploy to production

## 🎉 You're Ready to Start Developing!

All the foundation code is now in place. You can start building features following the development workflow in `GETTING_STARTED.md`.

Good luck with your project! 🚀
