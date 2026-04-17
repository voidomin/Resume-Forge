# 🎯 SmartResume Builder

An **ATS-optimized, role-based resume builder** that generates tailored resumes for specific job applications. Simply maintain one master profile and generate customized resumes for each job you apply to!

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Production%20v1.2.0-green.svg)
![CI/CD](https://github.com/voidomin/Resume-Forge/actions/workflows/test-and-deploy.yml/badge.svg)
![Netlify Status](https://api.netlify.com/api/v1/badges/99867c29-5d25-4c6e-8126-5b9123282fc2/deploy-status)

**🌐 [Live Demo](https://resumeforge2.netlify.app/login)** | [GitHub](https://github.com/voidomin/Resume-Forge)

---

## ✨ Features

- **Master Profile Management** – Store all your experiences, skills, and education in one place
- **AI-Powered Matching** – Automatically selects relevant content based on job descriptions using Gemini 3 Flash and fallback models
- **ATS Optimization** – Ensures your resume passes Applicant Tracking Systems with a dedicated score and keyword analysis
- **A4 One-Page Constraint** – Real-time "Scale-to-Fit" logic ensures your resume stays on a single professional page
- **AI Model Transparency** – Displays the exact AI model used for generation with clear fallback indicators
- **Multiple Export Formats** – Download as professional PDF or editable DOCX
- **Role-Specific Resumes** – Generate unique resumes for different job applications

---

## 🚀 Quick Start

### Try It Now

**Live Demo**: [https://resumeforge2.netlify.app/login](https://resumeforge2.netlify.app/login)

No installation required! Create an account and start building your resume immediately.

### Run Locally

#### Prerequisites

- Node.js v18+
- npm v9+
- PostgreSQL (or use Supabase - recommended)

### Getting Started

1. **Clone the repository**:

   ```bash
   git clone https://github.com/voidomin/Resume-Forge.git
   cd Resume-Forge
   ```

2. **Install dependencies**:

   ```bash
   # Backend
   cd resume-builder/backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Set up environment variables** – Create `.env` files in both frontend and backend using the `.env.example` templates.

4. **Start development servers**:

   ```bash
   # Backend (from resume-builder/backend)
   npm run dev

   # Frontend (from resume-builder/frontend)
   npm run dev
   ```

---

## 📚 Documentation

### Core Documentation

| Document                                                                    | Description                                            |
| --------------------------------------------------------------------------- | ------------------------------------------------------ |
| [PRD_Resume_Builder.md](docs/PRD_Resume_Builder.md)                         | Product requirements, goals, and success metrics       |
| [Design_Document_Resume_Builder.md](docs/Design_Document_Resume_Builder.md) | Technical architecture, data models, and scaling logic |
| [Tech_Stack_Resume_Builder.md](docs/Tech_Stack_Resume_Builder.md)           | Technology decisions, costs, and AI service selection  |
| [USER_GUIDE.md](docs/USER_GUIDE.md)                                         | Complete user guide and feature documentation          |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)                               | Common issues and solutions                            |

### Development

Please refer to the [docs/](docs/) folder for detailed technical documentation.


---

## 🛠️ Tech Stack

### Frontend

- **React 18** + TypeScript
- **Vite** – Lightning-fast build tool
- **Tailwind CSS** – Utility-first styling
- **Zustand** – State management
- **React Hook Form + Zod** – Form handling & validation

### Backend

- **Node.js** + TypeScript
- **Fastify** – High-performance web framework
- **Prisma** – Type-safe ORM
- **PostgreSQL** – Database
- **JWT + bcrypt** – Authentication

### Document Generation & AI

- **Gemini 2.5/3.0** – Multi-tier AI generation with resilient fallback
- **PDFKit** – Professional PDF generation
- **docx.js** – Structured DOCX generation
- **Playwright** – Comprehensive E2E testing & A4 validation

---

## 📁 Project Structure

```
Resume-Forge/
├── 📚 Documentation (root level)
│   ├── README.md
│   └── docs/
│       ├── PRD_Resume_Builder.md
│       ├── Design_Document_Resume_Builder.md
│       ├── Tech_Stack_Resume_Builder.md
│       ├── USER_GUIDE.md
│       └── TROUBLESHOOTING.md
│
├── 🏗️ resume-builder/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   └── lib/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── store/
│   │   │   ├── api/
│   │   │   └── types/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── shared/
│       ├── design-system.ts
│       └── unit-converters.ts
│
└── 🐳 Docker
    └── docker-compose.yml
```

---

## 💰 Hosting Cost

**$0/month** with free tiers:

- Frontend: Vercel
- Backend: Railway
- Database: Supabase

---

## 📋 Development Status

### v1.1.0 (Released - February 21, 2026) ✅

- [x] Content density engine with normal/compact/ultra-compact levels
- [x] Bidirectional fit scaling
- [x] Content-aware section spacing
- [x] Fixed AI selecting first items instead of most relevant
- [x] Fixed regenerate button using wrong job description
- [x] Fixed visual inconsistencies between preview, PDF, and DOCX
- [x] Unified design system across all templates

### v1.0.0 (Released - February 14, 2026) ✅

- [x] Project documentation
- [x] Authentication system
- [x] Basic UI components
- [x] Profile management
- [x] Resume generation engine (Gemini 3 Flash)
- [x] Document export (PDF/DOCX)
- [x] ATS validation & Score reporting
- [x] One-page A4 scaling architecture
- [x] AI Fallback & Failure transparency
- [x] 4 professional templates (Modern, Standard, Executive, Minimalist)
- [x] Comprehensive testing (37 unit tests, E2E tests)
- [x] Docker deployment setup
- [x] Production deployment

### v1.2.0 (Planned - Enhancements)

- [ ] Additional bug fixes from user feedback
- [ ] Performance optimizations
- [ ] Documentation improvements
- [ ] Optional sections (Coursework, Leadership, Awards)

### Future Roadmap

- [ ] Custom theme builder
- [ ] Browser extension for job sites
- [ ] Mobile app (iOS/Android)
- [ ] AI interview coach
- [ ] Collaborative resume reviews


---

## 🤝 Contributing

This is a personal project, but suggestions are welcome! Feel free to open an issue.

---

## 📄 License

MIT License - feel free to use this for your own projects!

---

_Built with ❤️ for job seekers everywhere_
