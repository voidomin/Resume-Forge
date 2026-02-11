# Resume Forge - User Guide

Welcome to **Resume Forge**, your AI-powered ATS-optimized resume builder. This guide will walk you through every feature and help you create winning resumes tailored to specific job applications.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Core Features](#core-features)
3. [Step-by-Step Workflow](#step-by-step-workflow)
4. [FAQ & Troubleshooting](#faq--troubleshooting)
5. [Best Practices](#best-practices)
6. [Keyboard Shortcuts](#keyboard-shortcuts)

---

## Getting Started

### Creating an Account

1. **Visit the Application**
   - Navigate to your Resume Forge instance (e.g., `https://your-domain.com`)

2. **Sign Up**
   - Click **"Create Account"** on the login page
   - Enter your email and a secure password (min. 6 characters)
   - Click **"Register"**
   - You'll be logged in automatically and redirected to the Dashboard

3. **Logging In**
   - Enter your email and password
   - Click **"Login"**
   - Stay logged in with our secure JWT authentication

---

## Core Features

### 1. Master Profile Management

Your master profile is your **single source of truth**. Store all your work experiences, education, skills, and projects here once—then tailor them for each job application.

#### Creating a Profile

1. From the Dashboard, click **"Edit My Profile"**
2. Fill in your **Personal Information**:
   - Full name
   - Email
   - Phone
   - Location
   - LinkedIn URL (optional)
   - GitHub URL (optional)
   - Portfolio URL (optional)
   - Professional summary (2-3 sentences about yourself)

3. **Add Experiences**:
   - Click **"+ Add Experience"**
   - Company name, job title, location, and dates
   - Bullet points describing key achievements (use action verbs like "Developed", "Led", "Optimized")
   - Mark as "Current" if ongoing
   - Click **"Save"**

4. **Add Education**:
   - Click **"+ Add Education"**
   - Institution, degree, field of study, dates, GPA (optional)
   - Click **"Save"**

5. **Add Skills**:
   - Click **"+ Add Skill"**
   - Skill name and category (Languages, Databases, Frameworks, Tools, Cloud, etc.)
   - Click **"Save"**

6. **Add Projects** (optional):
   - Click **"+ Add Project"**
   - Project name, description, technologies used, link
   - Click **"Save"**

7. **Add Certifications** (optional):
   - Click **"+ Add Certification"**
   - Certification name, issuer, date
   - Click **"Save"**

---

### 2. AI-Powered Resume Generation

Once your master profile is complete, generate tailored resumes for specific job postings.

#### Generating a Resume

1. From the Dashboard, click **"Generate New Resume"**

2. **Enter Job Details**:
   - **Resume Name**: Give it a descriptive name (e.g., "Google SWE - 2024")
   - **Job Description**: Paste the full job posting
   - Click **"Generate"**

3. **AI Processing**:
   - Resume Forge analyzes the job description
   - AI model (Gemini 2.5 Flash) selects the most relevant experiences, skills, and projects
   - A one-page, ATS-optimized resume is generated
   - **Model Transparency**: See exactly which AI model was used (primary or fallback)

4. **Review the Generated Resume**:
   - Preview is shown in real-time
   - All content fits on a single A4 page
   - Professional formatting with proper spacing

---

### 3. ATS Optimization & Scoring

ATS (Applicant Tracking System) scoring helps ensure your resume passes automated screening.

#### Understanding Your ATS Score

Your resume receives a score from 0-100 based on:

- **Keyword Match (40%)**: How many important keywords from the job description appear in your resume
- **Skills Match (30%)**: Alignment between required/preferred skills and your listed skills
- **Formatting (30%)**: Proper structure, no complex layouts, clean formatting

#### Improving Your Score

- **Add More Relevant Skills**: If the score is low, add missing skills to your master profile
- **Update Experiences**: Include quantifiable achievements with numbers and metrics
- **Use Job Keywords**: Naturally incorporate keywords from the job description into your profile

#### Keyword Analysis

The detailed keyword analysis shows:

- **Matched Keywords**: Keywords from the job description found in your resume (with locations)
- **Missing Keywords**: Important keywords not present in your resume
- **Match Percentage**: What % of job description keywords are covered

---

### 4. Download & Export

Once satisfied with your generated resume:

#### Download as PDF

1. Click the **Resume Preview** or **"Download PDF"** button
2. Your resume opens as a print-ready PDF
3. A browser print dialog appears—save as PDF or print directly

#### Download as DOCX

1. Click **"Download DOCX"**
2. An editable Word document (.docx) is downloaded
3. You can further edit it in Microsoft Word, Google Docs, or compatible software

#### Best Practices for Downloads

- **PDF for ATS**: Most applicant tracking systems prefer PDF format
- **DOCX for Customization**: Download as DOCX if you need last-minute edits
- **Naming Convention**: Name your file clearly (e.g., `FirstName_LastName_JobTitle_Date.pdf`)

---

## Step-by-Step Workflow

### Complete Workflow from Start to Finish

```
1. Create Account → 2. Build Master Profile → 3. Generate Tailored Resume
→ 4. Review ATS Score → 5. Improve if Needed → 6. Download & Submit
```

### Example Scenario

**Goal**: Apply for a "Senior Frontend Engineer" role at Acme Corp

1. **Master Profile Ready?**
   - Yes ✓ (you built it in previous applications)

2. **Generate Resume**
   - Paste the Acme Corp job posting
   - AI tailors your resume to highlight React, TypeScript, and leadership experience

3. **Check ATS Score**
   - Score: 78/100 (good)
   - Missing keyword: "Design Systems"
   - Add to your profile for next applications

4. **Download & Apply**
   - Download as PDF
   - Submit through company careers portal

---

## FAQ & Troubleshooting

### Q1: I forgot my password. How do I reset it?

**A**: Password reset is not yet available. For now, create a new account with a different email or contact support for assistance.

### Q2: My generated resume doesn't look right. What do I do?

**A**:

- Check if your profile information has proper formatting
- Ensure bullet points are concise (1-2 lines max)
- Try regenerating with an updated job description
- Download as DOCX and manually adjust if needed

### Q3: The ATS score is low. How can I improve it?

**A**:

- **Review missing keywords**: The report shows which keywords are absent
- **Add relevant skills**: Update your master profile with matching skills
- **Update experiences**: Add metrics and results (e.g., "Increased sales by 40%")
- **Regenerate**: Create a new resume and check if the score improves

### Q4: Can I edit the generated resume before downloading?

**A**:

- Current version: Generate resume → Download → Edit in Word/Google Docs
- Direct editing in-app is planned for future releases

### Q5: What if the AI fails to generate a resume?

**A**:

- **Fallback Mode**: Resume Forge has a fallback system
- Your resume is generated using a template if AI is unavailable
- You'll see a message indicating fallback mode was used
- The resume is still professional and downloadable

### Q6: Can I have multiple resumes for the same job?

**A**:

- Yes! Generate multiple resumes by giving them different names
- Compare the ATS scores to see which version performs better
- Example: "Google_SWE_v1", "Google_SWE_v2_optimized"

### Q7: Is my data secure?

**A**:

- ✅ Passwords are hashed with bcrypt
- ✅ JWT tokens secure your sessions
- ✅ HTTPS encryption in production
- ✅ Database access restricted to authorized processes
- ✅ Your data never leaves our secure servers

### Q8: Can I download my profile as JSON?

**A**:

- Feature coming in v1.1
- For now, manually export by copying profile text or taking screenshots

### Q9: What file formats are supported for resume import?

**A**:

- ✅ PDF (.pdf)
- ✅ Word (.docx)
- ✅ Coming soon: Google Docs, LinkedIn

---

## Best Practices

### Profile Best Practices

1. **Use Action Verbs**
   - ✅ Developed, Led, Optimized, Architected, Mentored
   - ❌ Responsible for, Worked on, Helped with

2. **Include Metrics**
   - ✅ "Increased conversion rate from 2% to 5% (150% improvement)"
   - ❌ "Improved conversion rate"

3. **Tailor Bullet Points to Audience**
   - For Backend roles: Emphasize systems design, databases, APIs
   - For Frontend roles: Emphasize UI/UX, performance, component libraries
   - For PM roles: Emphasize strategy, cross-functional collaboration, impact

4. **Keep Skills Current**
   - Regularly update with new languages, tools, frameworks
   - Remove outdated technologies (e.g., old versions of libraries)
   - Prioritize: List 5-8 most important skills

### Resume Generation Best Practices

1. **Copy Full Job Description**
   - Don't paraphrase; paste the complete job posting
   - AI extracts more accurate keywords from full text

2. **Use Descriptive Resume Names**
   - ❌ "Resume 1", "Resume 2"
   - ✅ "Google_SWE_Backend", "Meta_PM_Growth_2024"

3. **A/B Test Different Profiles**
   - Create versions with different focus areas
   - Compare ATS scores
   - Use the best-performing version

4. **Review ATS Feedback**
   - Pay attention to missing keywords
   - Proactively add them to your master profile
   - Regenerate for better scores on future applications

### Download & Submission Best Practices

1. **Always Download as PDF for ATS**
   - PDF is more reliably parsed by tracking systems
   - DOCX is for positions asking for editable files

2. **Use Consistent Naming**
   - `FirstName_LastName_JobTitle_Date.pdf`
   - Example: `John_Doe_SWE_Feb2024.pdf`

3. **Test Your Download**
   - Open the PDF in Adobe Reader or Preview
   - Verify formatting, spacing, and font rendering
   - Confirm all content fits on one page

4. **Update for Each Application**
   - Don't use the same resume for every job
   - Even small keyword changes improve ATS scores
   - Takes only 2-3 minutes per application

---

## Keyboard Shortcuts

| Action                     | Shortcut           |
| -------------------------- | ------------------ |
| Save Profile               | `Ctrl + S`         |
| Generate New Resume        | `Ctrl + G`         |
| Download PDF               | `Ctrl + Shift + D` |
| Download DOCX              | `Ctrl + Shift + E` |
| View ATS Score Details     | `Ctrl + Shift + A` |
| Logout                     | `Ctrl + L`         |
| Full Screen Resume Preview | `F11`              |
| Search Profiles/Resumes    | `Ctrl + F`         |

---

## Tips for Success

### 🎯 Maximize Your ATS Score

1. Front-load keywords in your profile
2. Use industry-standard terminology
3. Match job title keywords from postings
4. Include certifications and education clearly
5. List skills in order of importance

### 💪 Stand Out with Strong Content

1. Quantify all achievements
2. Show business impact (revenue, efficiency, user growth)
3. Demonstrate leadership and growth
4. Include cross-functional collaboration
5. Highlight learning and development

### ⏰ Save Time with Efficiency

1. Build your profile once, reuse forever
2. Generate multiple resumes from one profile
3. Use templates as starting points
4. Copy-paste from previous resumes
5. Batch update your profile after job searches

---

## Getting Help

### Need Support?

- **Email**: support@resumeforge.com
- **GitHub Issues**: Report bugs on [GitHub](https://github.com/voidomin/Resume-Forge/issues)
- **Documentation**: Review PRD and Design docs for technical details

### Report a Bug

1. Note the exact steps to reproduce
2. Include your browser (Chrome, Firefox, Safari)
3. Take a screenshot (redact personal info)
4. Email with date/time of issue

---

## What's Coming Next?

### v1.1 Features (Planned)

- [ ] Multi-template selection (Modern, Minimalist, Executive, Creative)
- [ ] Cover letter generation
- [ ] LinkedIn profile import
- [ ] Job applications tracker
- [ ] Interview preparation tips
- [ ] Analytics & insights dashboard

### v2.0 Features (Roadmap)

- [ ] Browser extension for job site integration
- [ ] Mobile app (iOS/Android)
- [ ] Collaborative resume reviews
- [ ] AI interview coach
- [ ] Networking recommendations

---

**Happy job hunting! 🚀**

_Resume Forge – Craft your perfect resume. Every time._
