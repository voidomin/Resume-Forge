# 🎯 SmartResume Builder

An **ATS-optimized, role-based resume builder** that generates tailored resumes for specific job applications. Simply maintain one master profile and generate customized resumes for each job you apply to!

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Development-yellow.svg)

---

## ✨ Features

- **Master Profile Management** – Store all your experiences, skills, and education in one place
- **AI-Powered Matching** – Automatically selects relevant content based on job descriptions
- **ATS Optimization** – Ensures your resume passes Applicant Tracking Systems
- **Multiple Export Formats** – Download as PDF or DOCX
- **Role-Specific Resumes** – Generate unique resumes for different job applications

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- npm v9+
- PostgreSQL (or use Supabase - recommended)

### Getting Started

1. **Read the documentation** – Start with [START_HERE_README.md](START_HERE_README.md)
2. **Run the setup script** (Linux/Mac):
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
3. **Or follow manual setup** – See [GETTING_STARTED.md](GETTING_STARTED.md)

---

## 📚 Documentation

| Document                                                               | Description                                                |
| ---------------------------------------------------------------------- | ---------------------------------------------------------- |
| [START_HERE_README.md](START_HERE_README.md)                           | 📍 **Start here!** Complete overview and quick start guide |
| [INDEX.md](INDEX.md)                                                   | File index and navigation                                  |
| [GETTING_STARTED.md](GETTING_STARTED.md)                               | Step-by-step development guide                             |
| [FILE_PLACEMENT_GUIDE.md](FILE_PLACEMENT_GUIDE.md)                     | Where to place each code file                              |
| [PRD_Resume_Builder.md](PRD_Resume_Builder.md)                         | Product requirements document                              |
| [Design_Document_Resume_Builder.md](Design_Document_Resume_Builder.md) | Technical architecture & design                            |
| [Tech_Stack_Resume_Builder.md](Tech_Stack_Resume_Builder.md)           | Technology decisions & costs                               |

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

### Document Generation

- **PDFKit** – PDF generation
- **docx** – DOCX generation
- **natural** – NLP for keyword extraction

---

## 📁 Project Structure

```
cv-maker/
├── 📚 Documentation
│   ├── START_HERE_README.md
│   ├── INDEX.md
│   ├── GETTING_STARTED.md
│   ├── FILE_PLACEMENT_GUIDE.md
│   ├── PRD_Resume_Builder.md
│   ├── Design_Document_Resume_Builder.md
│   └── Tech_Stack_Resume_Builder.md
│
├── 🔧 Setup
│   └── setup.sh
│
├── ⚙️ Backend Code
│   ├── backend_index.ts
│   ├── backend_auth_routes.ts
│   ├── backend_auth_controller.ts
│   ├── backend_auth_middleware.ts
│   ├── backend_profile_routes.ts
│   └── backend_resume_routes.ts
│
└── 🎨 Frontend Code
    ├── frontend_App.tsx
    ├── frontend_authStore.ts
    ├── frontend_Login.tsx
    ├── frontend_Register.tsx
    ├── frontend_Dashboard.tsx
    ├── frontend_Header.tsx
    ├── frontend_Footer.tsx
    └── frontend_PlaceholderPages.tsx
```

---

## 💰 Hosting Cost

**$0/month** with free tiers:

- Frontend: Vercel
- Backend: Railway
- Database: Supabase

---

## 📋 Development Roadmap

- [x] Project documentation
- [x] Authentication system (starter code)
- [x] Basic UI components
- [ ] Profile management
- [ ] Resume generation engine
- [ ] Document export (PDF/DOCX)
- [ ] ATS validation
- [ ] Deployment

---

## 🤝 Contributing

This is a personal project, but suggestions are welcome! Feel free to open an issue.

---

## 📄 License

MIT License - feel free to use this for your own projects!

---

_Built with ❤️ for job seekers everywhere_
