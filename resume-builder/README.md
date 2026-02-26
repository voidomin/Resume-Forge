# SmartResume Builder - AI-Powered ATS Optimizer

SmartResume is a full-stack web application designed to help job seekers create tailored, ATS-optimized resumes. By providing a job description and a professional profile, the AI (powered by Google Gemini) generates content focused on matching keywords and highlighting relevant achievements.

## 🚀 Key Features

- **AI-Driven Personalization**: Uses Gemini AI to tailor your resume specifically for a target job description.
- **ATS Multi-Check**: Runs an automated scan for keywords and formatting compatibility.
- **Dynamic Content Density**: Automatically adjusts margins, font sizes, and line-heights to fit content perfectly on one page.
- **Multi-Format Export**: Download your resumes in high-quality PDF (native print) or DOCX formats.
- **Responsive Design**: Fully optimized for mobile and desktop usage with modern glassmorphism UI.
- **Micro-Animations**: Fluid UI transitions and skeleton loaders for a premium user experience.

## 🛠️ Technology Stack

### Frontend

- **React (Vite)**: Modern, lightweight frontend framework.
- **Tailwind CSS**: Utility-first styling with custom glassmorphism and animations.
- **Zustand**: Simple and performant state management.
- **Lucide React**: Beautiful, consistent icon set.
- **React Router**: Client-side routing.

### Backend

- **Fastify**: High-performance Node.js web framework.
- **TypeScript**: Type-safe development across the stack.
- **Prisma**: Modern ORM for database management.
- **Google Gemini AI**: Powering resume optimization and ATS analysis.
- **PDFKit & docx**: Native document generation engines.

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (or another database supported by Prisma)
- Google Gemini API Key

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/voidomin/Resume-Forge.git
   cd resume-builder
   ```

2. **Setup Backend**:

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your credentials
   npx prisma migrate dev
   npm run dev
   ```

3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Update .env if necessary
   npm run dev
   ```

## 📜 License

[MIT](LICENSE)
