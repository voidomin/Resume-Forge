#!/bin/bash

# Resume Builder - Quick Start Setup Script
# This script will set up your entire project structure

set -e  # Exit on error

echo "🚀 Setting up Resume Builder Project..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create main project directory
PROJECT_DIR="resume-builder"
echo -e "${BLUE}📁 Creating project directory: $PROJECT_DIR${NC}"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Initialize Git
echo -e "${BLUE}🔧 Initializing Git repository${NC}"
git init

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

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Misc
.cache/
temp/
EOF

echo -e "${GREEN}✓ Created .gitignore${NC}"

# Create directory structure
echo -e "${BLUE}📂 Creating project structure${NC}"
mkdir -p frontend/src/{components/{common,Profile,Resume,Auth,Editor},pages,hooks,store,utils,types,api}
mkdir -p backend/src/{routes,controllers,services/{matching,generation,ats},middleware,utils,types}
mkdir -p backend/prisma
mkdir -p shared/types
mkdir -p docs

echo -e "${GREEN}✓ Project structure created${NC}"

# Setup Frontend
echo -e "${BLUE}🎨 Setting up Frontend (React + TypeScript + Vite)${NC}"
cd frontend

# Create package.json
cat > package.json << 'EOF'
{
  "name": "resume-builder-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "zustand": "^4.4.7",
    "axios": "^1.6.2",
    "react-hook-form": "^7.49.2",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.3",
    "date-fns": "^3.0.6",
    "lucide-react": "^0.303.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@types/node": "^20.10.6",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
EOF

echo -e "${YELLOW}📦 Installing frontend dependencies (this may take a few minutes)...${NC}"
npm install

# Create Vite config
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
EOF

# Create TypeScript config
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# Create Tailwind config
npx tailwindcss init -p

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

# Create index.html
cat > index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SmartResume Builder</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# Create main.tsx
cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

# Create index.css
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

# Create .env
cat > .env << 'EOF'
VITE_API_URL=http://localhost:3000/api
EOF

echo -e "${GREEN}✓ Frontend setup complete${NC}"

# Setup Backend
echo -e "${BLUE}⚙️  Setting up Backend (Node.js + TypeScript + Fastify)${NC}"
cd ../backend

# Create package.json
cat > package.json << 'EOF'
{
  "name": "resume-builder-backend",
  "version": "1.0.0",
  "description": "Backend for Resume Builder",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:push": "prisma db push"
  },
  "dependencies": {
    "fastify": "^4.25.2",
    "@fastify/cors": "^8.5.0",
    "@fastify/jwt": "^7.2.3",
    "@fastify/multipart": "^8.0.0",
    "@prisma/client": "^5.7.1",
    "bcrypt": "^5.1.1",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "pdfkit": "^0.13.0",
    "docx": "^8.5.0",
    "natural": "^6.10.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "prisma": "^5.7.1",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.3.3"
  }
}
EOF

echo -e "${YELLOW}📦 Installing backend dependencies (this may take a few minutes)...${NC}"
npm install

# Create TypeScript config
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

# Create .env
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/resume_builder?schema=public"

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"

# Server
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"
EOF

# Initialize Prisma
npx prisma init

echo -e "${GREEN}✓ Backend setup complete${NC}"

# Create README
cd ..
cat > README.md << 'EOF'
# Resume Builder

An ATS-optimized, role-based resume builder that generates tailored resumes for specific job applications.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (or use Supabase)
- npm or yarn

### Setup

1. **Install Dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

2. **Configure Database**
   - Create a PostgreSQL database
   - Update `backend/.env` with your database URL
   - Or use Supabase (recommended): https://supabase.com

3. **Run Migrations**
   ```bash
   cd backend
   npm run prisma:migrate
   ```

4. **Start Development Servers**
   
   Terminal 1 - Backend:
   ```bash
   cd backend
   npm run dev
   ```
   
   Terminal 2 - Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

5. **Open Browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Project Structure

```
resume-builder/
├── frontend/          # React frontend
├── backend/           # Node.js backend
├── shared/            # Shared types
└── docs/              # Documentation
```

## Features

- ✅ User authentication
- 🎯 Master profile management
- 🤖 AI-powered job description matching
- 📄 ATS-optimized resume generation
- 💾 Export to PDF and DOCX
- 🔒 Secure and private

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Zustand (state management)
- React Router
- Axios

### Backend
- Node.js
- TypeScript
- Fastify
- Prisma (ORM)
- PostgreSQL
- JWT authentication

## Development

See `docs/GETTING_STARTED.md` for detailed development guide.

## License

MIT
EOF

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo -e "1. ${YELLOW}Set up your database:${NC}"
echo "   - Create a PostgreSQL database"
echo "   - Or sign up for free at https://supabase.com"
echo "   - Update backend/.env with your DATABASE_URL"
echo ""
echo -e "2. ${YELLOW}Run database migrations:${NC}"
echo "   cd backend"
echo "   npm run prisma:migrate"
echo ""
echo -e "3. ${YELLOW}Start the backend:${NC}"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo -e "4. ${YELLOW}Start the frontend (in a new terminal):${NC}"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo -e "5. ${YELLOW}Open your browser:${NC}"
echo "   http://localhost:5173"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
