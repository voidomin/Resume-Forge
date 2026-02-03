# Design Document
## ATS-Optimized Role-Based Resume Builder

### 1. System Architecture

#### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Profile   │  │   Resume     │  │   Export &       │   │
│  │ Management  │  │  Generator   │  │   Preview        │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                   ┌────────┴────────┐
                   │   API Gateway   │
                   └────────┬────────┘
                            │
┌───────────────────────────┴───────────────────────────────┐
│                     Backend Layer                          │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Profile   │  │   Matching   │  │   Document      │  │
│  │   Service   │  │   Engine     │  │   Generator     │  │
│  └─────────────┘  └──────────────┘  └─────────────────┘  │
│                                                            │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Auth      │  │   ATS        │  │   Storage       │  │
│  │   Service   │  │   Validator  │  │   Service       │  │
│  └─────────────┘  └──────────────┘  └─────────────────┘  │
└────────────────────────────────────────────────────────────┘
                            │
                   ┌────────┴────────┐
                   │    Database     │
                   └─────────────────┘
```

#### 1.2 Component Descriptions

**Frontend Components:**
- **Profile Management:** UI for creating/editing master profile
- **Resume Generator:** Job description input and resume preview
- **Export & Preview:** Resume rendering and download functionality

**Backend Services:**
- **Profile Service:** CRUD operations for user profiles
- **Matching Engine:** Analyzes job descriptions and matches with profile content
- **Document Generator:** Creates formatted resume documents
- **Auth Service:** User authentication and authorization
- **ATS Validator:** Checks resume for ATS compatibility
- **Storage Service:** Manages file storage and retrieval

---

### 2. Data Models

#### 2.1 User Schema

```javascript
User {
  id: UUID (primary key)
  email: String (unique, indexed)
  passwordHash: String
  createdAt: Timestamp
  updatedAt: Timestamp
  profile: Profile (reference)
}
```

#### 2.2 Profile Schema

```javascript
Profile {
  id: UUID (primary key)
  userId: UUID (foreign key)
  personalInfo: {
    firstName: String
    lastName: String
    email: String
    phone: String
    location: String
    linkedin: String (optional)
    github: String (optional)
    portfolio: String (optional)
  }
  summary: String (500 chars max)
  experiences: [Experience]
  education: [Education]
  skills: [Skill]
  certifications: [Certification]
  projects: [Project]
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 2.3 Experience Schema

```javascript
Experience {
  id: UUID
  company: String
  role: String
  location: String
  startDate: Date
  endDate: Date (null for current)
  current: Boolean
  responsibilities: [String] (bullet points)
  achievements: [String] (bullet points)
  keywords: [String] (tags for matching)
  domains: [String] (e.g., "fintech", "healthcare")
  alwaysInclude: Boolean (default: false)
  exclude: Boolean (default: false)
}
```

#### 2.4 Education Schema

```javascript
Education {
  id: UUID
  institution: String
  degree: String
  field: String
  location: String
  startDate: Date
  endDate: Date
  gpa: Float (optional)
  relevantCoursework: [String] (optional)
  achievements: [String] (optional)
}
```

#### 2.5 Skill Schema

```javascript
Skill {
  id: UUID
  name: String
  category: Enum ["technical", "soft", "tool", "language", "framework"]
  proficiency: Enum ["beginner", "intermediate", "advanced", "expert"]
  yearsOfExperience: Integer (optional)
  keywords: [String] (related terms for matching)
}
```

#### 2.6 Resume Schema

```javascript
Resume {
  id: UUID (primary key)
  userId: UUID (foreign key)
  profileId: UUID (foreign key)
  name: String (user-defined name)
  jobDescription: String
  extractedKeywords: [String]
  targetRole: String
  selectedContent: {
    experiences: [UUID] (references to Experience ids)
    education: [UUID]
    skills: [UUID]
    certifications: [UUID]
    projects: [UUID]
  }
  customizations: Object (user edits)
  atsScore: Float (0-100)
  format: Enum ["chronological", "functional", "combination"]
  createdAt: Timestamp
  updatedAt: Timestamp
  lastDownloaded: Timestamp
}
```

#### 2.7 Job Description Analysis Schema

```javascript
JobAnalysis {
  id: UUID
  resumeId: UUID (foreign key)
  requiredSkills: [String]
  preferredSkills: [String]
  keywords: [String]
  experienceLevel: Enum ["entry", "mid", "senior", "lead"]
  domains: [String]
  responsibilities: [String]
  analyzedAt: Timestamp
}
```

---

### 3. API Design

#### 3.1 Profile Management APIs

```
POST   /api/profile
GET    /api/profile
PUT    /api/profile
DELETE /api/profile

POST   /api/profile/experiences
PUT    /api/profile/experiences/:id
DELETE /api/profile/experiences/:id

POST   /api/profile/education
PUT    /api/profile/education/:id
DELETE /api/profile/education/:id

POST   /api/profile/skills
PUT    /api/profile/skills/:id
DELETE /api/profile/skills/:id
```

#### 3.2 Resume Generation APIs

```
POST   /api/resumes/generate
  Body: {
    jobDescription: String,
    targetRole: String,
    format: String (optional)
  }
  Response: {
    resumeId: UUID,
    selectedContent: Object,
    atsScore: Float,
    suggestions: [String]
  }

GET    /api/resumes
GET    /api/resumes/:id
PUT    /api/resumes/:id
DELETE /api/resumes/:id

POST   /api/resumes/:id/customize
  Body: {
    customizations: Object
  }

GET    /api/resumes/:id/preview
POST   /api/resumes/:id/export
  Query: format=pdf|docx
  Response: Binary file stream
```

#### 3.3 ATS Validation APIs

```
POST   /api/ats/validate
  Body: {
    resumeId: UUID
  }
  Response: {
    score: Float,
    issues: [{
      type: String,
      severity: String,
      message: String,
      suggestion: String
    }]
  }
```

#### 3.4 Authentication APIs

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
```

---

### 4. Matching Engine Algorithm

#### 4.1 Job Description Analysis

```
1. Extract Keywords:
   - Use NLP to identify nouns, verbs, technical terms
   - Identify required vs. preferred qualifications
   - Extract experience level indicators
   - Identify industry/domain terms

2. Skill Extraction:
   - Match against common skill databases
   - Identify tools, technologies, frameworks
   - Extract soft skills

3. Priority Scoring:
   - Required skills: weight 10
   - Preferred skills: weight 5
   - Keywords in job title: weight 8
   - Keywords in responsibilities: weight 6
```

#### 4.2 Content Matching Algorithm

```python
def match_experiences(job_analysis, profile_experiences):
    scored_experiences = []
    
    for experience in profile_experiences:
        score = 0
        
        # Keyword matching
        for keyword in job_analysis.keywords:
            if keyword in experience.responsibilities or 
               keyword in experience.achievements:
                score += keyword.weight
        
        # Domain matching
        if experience.domains intersects job_analysis.domains:
            score += 15
        
        # Recency bonus (last 5 years)
        years_ago = (current_date - experience.endDate) / 365
        if years_ago <= 5:
            score += (5 - years_ago) * 2
        
        # Always include override
        if experience.alwaysInclude:
            score = 9999
        
        # Exclude override
        if experience.exclude:
            continue
        
        scored_experiences.append({
            'experience': experience,
            'score': score
        })
    
    # Sort by score and select top experiences
    sorted_experiences = sort(scored_experiences, by='score', desc=True)
    
    # Select top 4-6 most relevant experiences
    return select_top(sorted_experiences, count=5)
```

#### 4.3 Skill Selection

```python
def select_skills(job_analysis, profile_skills):
    # Prioritize skills mentioned in job description
    required_skills = match_skills(profile_skills, job_analysis.requiredSkills)
    preferred_skills = match_skills(profile_skills, job_analysis.preferredSkills)
    
    # Add high-proficiency skills even if not mentioned
    expert_skills = filter(profile_skills, proficiency="expert")
    
    # Combine and deduplicate
    selected_skills = deduplicate(
        required_skills + preferred_skills + expert_skills[:3]
    )
    
    # Limit to 15-20 skills
    return selected_skills[:20]
```

---

### 5. ATS Optimization Rules

#### 5.1 Formatting Rules

```javascript
atsRules = {
  fonts: ["Arial", "Calibri", "Helvetica", "Times New Roman"],
  fontSize: {
    name: [16, 20],
    sectionHeaders: [12, 14],
    body: [10, 12]
  },
  margins: {
    min: 0.5, // inches
    max: 1.0
  },
  avoid: [
    "images",
    "graphics",
    "tables",
    "text boxes",
    "headers/footers",
    "columns",
    "special characters"
  ],
  sectionHeaders: [
    "Professional Summary",
    "Work Experience",
    "Education",
    "Skills",
    "Certifications",
    "Projects"
  ],
  bulletPoints: {
    style: "simple", // • or - only
    startWithActionVerb: true
  }
}
```

#### 5.2 Validation Checks

```javascript
atsValidation = {
  checks: [
    {
      id: "font-check",
      rule: "Font must be ATS-friendly",
      severity: "high",
      validate: (resume) => atsRules.fonts.includes(resume.font)
    },
    {
      id: "section-headers",
      rule: "Use standard section headers",
      severity: "high",
      validate: (resume) => standardHeaders.all(h => resume.sections.includes(h))
    },
    {
      id: "contact-info",
      rule: "Contact info must be in text format",
      severity: "critical",
      validate: (resume) => !hasImagesInContact(resume)
    },
    {
      id: "keyword-density",
      rule: "Include relevant keywords",
      severity: "medium",
      validate: (resume, job) => keywordMatch(resume, job) > 60%
    },
    {
      id: "file-format",
      rule: "Use .docx or .pdf format",
      severity: "high",
      validate: (file) => ['.docx', '.pdf'].includes(file.extension)
    }
  ]
}
```

---

### 6. UI/UX Design

#### 6.1 Page Structure

**Layout:**
- Top Navigation: Logo, Profile, Resumes, Logout
- Sidebar (contextual): Quick actions, tips
- Main Content Area: Primary workspace
- Footer: Links, support

#### 6.2 Key Screens

**1. Dashboard**
```
┌────────────────────────────────────────────────┐
│  SmartResume Builder              [Profile] ▼  │
├────────────────────────────────────────────────┤
│                                                │
│  Welcome back, [Name]!                         │
│                                                │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │  Master Profile  │  │  My Resumes      │   │
│  │                  │  │                  │   │
│  │  [Edit Profile]  │  │  Resume v1       │   │
│  │                  │  │  Resume v2       │   │
│  │  Last updated:   │  │  Resume v3       │   │
│  │  2 days ago      │  │                  │   │
│  │                  │  │  [+ New Resume]  │   │
│  └──────────────────┘  └──────────────────┘   │
│                                                │
│  Quick Actions:                                │
│  [+ Generate New Resume]  [Edit Profile]       │
│                                                │
└────────────────────────────────────────────────┘
```

**2. Profile Management**
```
┌────────────────────────────────────────────────┐
│  Master Profile                    [Save]       │
├────────────────────────────────────────────────┤
│  Tabs: [Personal Info] [Experience] [Education]│
│        [Skills] [Certifications] [Projects]     │
├────────────────────────────────────────────────┤
│                                                │
│  Work Experience                               │
│  ┌──────────────────────────────────────────┐ │
│  │ Software Engineer @ TechCorp      [Edit] │ │
│  │ Jan 2020 - Present                [Delete]│ │
│  │                                           │ │
│  │ • Developed microservices...              │ │
│  │ • Led team of 5 engineers...              │ │
│  │                                           │ │
│  │ Tags: backend, leadership, python         │ │
│  │ [Always Include] [Exclude]                │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  [+ Add Experience]                            │
│                                                │
└────────────────────────────────────────────────┘
```

**3. Resume Generator**
```
┌────────────────────────────────────────────────┐
│  Generate Resume                   Step 1 of 3 │
├────────────────────────────────────────────────┤
│                                                │
│  Job Description                               │
│  ┌──────────────────────────────────────────┐ │
│  │                                          │ │
│  │  Paste job description here or enter    │ │
│  │  target role details...                 │ │
│  │                                          │ │
│  │                                          │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  OR                                            │
│                                                │
│  Target Role: [Software Engineer        ▼]    │
│  Industry:    [Technology               ▼]    │
│  Level:       [Mid-level                ▼]    │
│                                                │
│                    [Cancel]  [Next: Preview]   │
└────────────────────────────────────────────────┘
```

**4. Resume Preview & Edit**
```
┌────────────────────────────────────────────────┐
│  Resume Preview              ATS Score: 92/100 │
├─────────────────────┬──────────────────────────┤
│ Sidebar:            │  JOHN DOE                │
│                     │  john@email.com          │
│ Sections:           │                          │
│ ☑ Summary           │  PROFESSIONAL SUMMARY    │
│ ☑ Experience (3)    │  [Editable text...]      │
│ ☑ Education         │                          │
│ ☑ Skills (12)       │  WORK EXPERIENCE         │
│ ☐ Certifications    │  Software Engineer       │
│ ☐ Projects          │  TechCorp | 2020-Present │
│                     │  • [Editable bullet]     │
│ [Reorder Sections]  │  • [Editable bullet]     │
│                     │                          │
│ Format:             │  EDUCATION               │
│ ○ Chronological     │  [Editable content...]   │
│ ○ Functional        │                          │
│ ○ Combination       │  SKILLS                  │
│                     │  [Editable skills...]    │
│ [Download PDF]      │                          │
│ [Download DOCX]     │                          │
│ [Save Version]      │                          │
└─────────────────────┴──────────────────────────┘
```

#### 6.3 User Flow

```
1. User Login/Registration
   ↓
2. Dashboard
   ↓
3. Edit Master Profile (if first time)
   ↓
4. Generate New Resume
   ↓
5. Input Job Description
   ↓
6. AI Matching & Content Selection
   ↓
7. Preview Generated Resume
   ↓
8. Edit & Customize
   ↓
9. ATS Validation Check
   ↓
10. Download (PDF/DOCX)
    ↓
11. Save Version
```

---

### 7. Document Generation

#### 7.1 Resume Templates

**Template Structure:**
```
CONTACT INFORMATION
NAME (Large, Bold)
Email | Phone | Location | LinkedIn | GitHub

PROFESSIONAL SUMMARY
2-3 sentences highlighting key qualifications

WORK EXPERIENCE (Reverse Chronological)
Job Title | Company | Location | Dates
• Bullet point (action verb + achievement + metric)
• Bullet point
• Bullet point

EDUCATION
Degree, Field | Institution | Location | Graduation Date
GPA (if >3.5) | Relevant Coursework

SKILLS
Category: Skill1, Skill2, Skill3, ...

CERTIFICATIONS (Optional)
Certification Name | Issuing Organization | Date

PROJECTS (Optional)
Project Name | Technologies Used
• Description and impact
```

#### 7.2 PDF Generation

**Library:** jsPDF or PDFKit

**Process:**
1. Convert resume data to structured format
2. Apply ATS-friendly formatting rules
3. Generate PDF with selectable text
4. Ensure no compression or image conversion
5. Validate PDF readability

#### 7.3 DOCX Generation

**Library:** docx.js

**Process:**
1. Create document with standard styles
2. Add sections with proper formatting
3. Use standard bullet points
4. Ensure compatibility with Word 2010+
5. No macros or embedded objects

---

### 8. Security Considerations

#### 8.1 Authentication
- JWT-based authentication
- Secure password hashing (bcrypt, 10+ rounds)
- Session timeout after 24 hours
- Refresh token rotation

#### 8.2 Data Protection
- Encrypt sensitive data at rest (AES-256)
- HTTPS for all communications (TLS 1.3)
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection (content security policy)

#### 8.3 Privacy
- No third-party data sharing
- User data deletion on account closure
- Regular data backups
- Audit logging for sensitive operations

---

### 9. Performance Optimization

#### 9.1 Frontend
- Code splitting and lazy loading
- Image optimization
- Caching strategy (service workers)
- Minimized bundle size
- Debounced search and input

#### 9.2 Backend
- Database indexing (user_id, email)
- Query optimization
- Response caching (Redis)
- Async processing for document generation
- Rate limiting (100 requests/hour per user)

#### 9.3 Database
- Connection pooling
- Pagination for large result sets
- Denormalization where appropriate
- Regular vacuum/optimization

---

### 10. Testing Strategy

#### 10.1 Unit Tests
- Profile CRUD operations
- Matching algorithm accuracy
- ATS validation logic
- Document generation

#### 10.2 Integration Tests
- End-to-end resume generation flow
- API endpoint testing
- Database operations
- Authentication flow

#### 10.3 User Acceptance Testing
- Test with real job descriptions
- Verify ATS compatibility with online checkers
- User feedback on generated resumes
- Performance benchmarking

#### 10.4 Test Data
- Sample profiles with diverse experiences
- 20+ real job descriptions across industries
- Edge cases (minimal experience, career changes)

---

### 11. Deployment Architecture

```
┌─────────────────────────────────────────┐
│           Load Balancer / CDN           │
│              (Cloudflare)               │
└───────────────┬─────────────────────────┘
                │
        ┌───────┴────────┐
        │                │
┌───────▼──────┐  ┌──────▼───────┐
│   Frontend   │  │   Backend    │
│  (Vercel/    │  │   (Railway/  │
│   Netlify)   │  │   Render)    │
└──────────────┘  └──────┬───────┘
                         │
                  ┌──────┴───────┐
                  │              │
          ┌───────▼────┐  ┌──────▼──────┐
          │ PostgreSQL │  │   Storage   │
          │            │  │  (S3/Cloud) │
          └────────────┘  └─────────────┘
```

---

### 12. Error Handling

#### 12.1 Error Categories

```javascript
errors = {
  VALIDATION_ERROR: {
    code: 400,
    message: "Invalid input data",
    userMessage: "Please check your input and try again"
  },
  NOT_FOUND: {
    code: 404,
    message: "Resource not found",
    userMessage: "The requested item could not be found"
  },
  GENERATION_FAILED: {
    code: 500,
    message: "Resume generation failed",
    userMessage: "We couldn't generate your resume. Please try again"
  },
  ATS_CHECK_FAILED: {
    code: 500,
    message: "ATS validation failed",
    userMessage: "We couldn't validate ATS compatibility"
  }
}
```

#### 12.2 User-Facing Error Messages
- Clear, actionable messages
- Suggest next steps
- Provide support contact for persistent errors
- Log errors for debugging without exposing internals

---

### 13. Monitoring and Analytics

#### 13.1 Metrics to Track
- Resume generation success rate
- Average ATS score
- Time to generate resume
- User retention (weekly/monthly active users)
- Most common job descriptions/roles
- Feature usage (export format preferences)

#### 13.2 Logging
- Application logs (errors, warnings)
- Access logs
- Performance metrics
- User actions (anonymized)

---

### 14. Documentation Requirements

#### 14.1 User Documentation
- Getting started guide
- Profile management tutorial
- Resume generation walkthrough
- ATS optimization tips
- FAQ

#### 14.2 Technical Documentation
- API reference
- Database schema
- Deployment guide
- Troubleshooting guide
- Code comments and README files
