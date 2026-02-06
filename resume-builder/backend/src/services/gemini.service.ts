import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary?: string;
  experiences: {
    company: string;
    role: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    bullets: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
  }[];
  skills: {
    name: string;
    category: string;
  }[];
  projects?: {
    name: string;
    description: string;
    technologies?: string;
    link?: string;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    date?: string;
  }[];
}

export interface GeneratedResume {
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  experiences: {
    company: string;
    role: string;
    location?: string;
    dateRange: string;
    bullets: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    dateRange: string;
    gpa?: string;
  }[];
  skills: string[];
  skillsCategories?: {
    Languages?: string[];
    Databases?: string[];
    Frameworks?: string[];
    Tools?: string[];
    Cloud?: string[];
    "Machine Learning"?: string[];
    "Data Analytics"?: string[];
    [key: string]: string[] | undefined;
  };
  projects?: {
    name: string;
    description?: string;
    bullets?: string[];
    technologies?: string;
    link?: string;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    date?: string;
    link?: string;
  }[];
  atsScore: number;
  atsScoreBreakdown?: {
    keywordMatch: number;
    skillsMatch: number;
    formatting: number;
    missingKeywords: string[];
    explanation: string;
  };
  keywords: string[];
  keywordAnalysis?: {
    matchedKeywords: {
      keyword: string;
      locations: string[]; // e.g., ["summary", "experience.0.bullets.1", "skills"]
    }[];
    missingKeywords: string[];
    totalJobKeywords: number;
    matchPercentage: number;
  };
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

  /**
   * Analyze job description and extract key requirements
   */
  async analyzeJobDescription(jobDescription: string): Promise<{
    requiredSkills: string[];
    preferredSkills: string[];
    keywords: string[];
    experienceLevel: string;
    roleTitle: string;
  }> {
    const prompt = `Analyze this job description and extract key information. Return ONLY valid JSON, no markdown.

Job Description:
${jobDescription}

Return this exact JSON structure:
{
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "keywords": ["keyword1", "keyword2"],
  "experienceLevel": "entry|mid|senior|lead",
  "roleTitle": "extracted job title"
}`;

    // Models available per user's rate limits dashboard
    const modelsToTry = [
      "models/gemini-2.5-flash", // Available in rate limits
      "models/gemini-1.5-flash", // Standard model
      "models/gemini-1.5-pro", // Pro model
    ];

    for (const modelName of modelsToTry) {
      try {
        console.log(`Analyzing JD with model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        // Clean up response - remove markdown code blocks if present
        const cleanJson = response
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        console.log(`✅ JD analysis successful with ${modelName}`);
        return JSON.parse(cleanJson);
      } catch (error: any) {
        console.log(
          `JD analysis failed with ${modelName}: ${error.message?.slice(0, 100)}...`,
        );

        // Rate limited
        if (error.message?.includes("429")) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        if (error.message?.includes("404")) continue;
      }
    }

    console.error("All models failed for JD analysis, using defaults");
    return {
      requiredSkills: [],
      preferredSkills: [],
      keywords: [],
      experienceLevel: "mid",
      roleTitle: "Software Engineer",
    };
  }

  /**
   * Generate an ATS-optimized resume tailored to the job description
   */
  /**
   * Generate an ATS-optimized resume tailored to the job description
   */
  async generateOptimizedResume(
    profile: ProfileData,
    jobDescription: string,
  ): Promise<GeneratedResume> {
    const jobAnalysis = await this.analyzeJobDescription(jobDescription);

    const prompt = `You are an expert resume writer. Create an ATS-optimized, one-page resume tailored to this job.

CANDIDATE PROFILE:
Name: ${profile.firstName} ${profile.lastName}
Email: ${profile.email}
Phone: ${profile.phone || "N/A"}
Location: ${profile.location || "N/A"}
LinkedIn: ${profile.linkedin || "N/A"}
GitHub: ${profile.github || "N/A"}
Portfolio: ${profile.portfolio || "N/A"}

**IMPORTANT PRE-INSTRUCTION**: You MUST include the exact Portfolio, LinkedIn, and GitHub links provided above in the final JSON. Do not omit them.

Current Summary: ${profile.summary || "None provided"}

WORK EXPERIENCE (Original):
${profile.experiences
  .map(
    (exp) => `
Company: ${exp.company}
Role: ${exp.role}
Location: ${exp.location || "N/A"}
Dates: ${exp.startDate} - ${exp.current ? "Present" : exp.endDate}
Achievements:
${exp.bullets.map((b) => `- ${b}`).join("\n")}
`,
  )
  .join("\n---\n")}

EDUCATION:
${profile.education
  .map(
    (edu) => `
${edu.degree} in ${edu.field}
${edu.institution}${edu.location ? `, ${edu.location}` : ""}
${edu.endDate || "N/A"}${edu.gpa ? ` | GPA: ${edu.gpa}` : ""}
`,
  )
  .join("\n")}

SKILLS:
${profile.skills.map((s) => s.name).join(", ")}

PROJECTS:
${
  profile.projects
    ?.map(
      (p) => `
Name: ${p.name}
Description: ${p.description}
Technologies: ${p.technologies || "N/A"}
Link: ${p.link || "N/A"}
`,
    )
    .join("\n") || "None provided"
}

CERTIFICATIONS:
${
  profile.certifications
    ?.map(
      (c) => `
Name: ${c.name}
Issuer: ${c.issuer}
Date: ${c.date || "N/A"}
`,
    )
    .join("\n") || "None provided"
}

TARGET JOB:
Title: ${jobAnalysis.roleTitle}
Required Skills: ${jobAnalysis.requiredSkills.join(", ")}
Keywords to include: ${jobAnalysis.keywords.join(", ")}
Experience Level: ${jobAnalysis.experienceLevel}

JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS:
**GOAL: Create a PROFESSIONAL, ONE A4 PAGE RESUME tailored to this job that FILLS THE ENTIRE PAGE.**

**CRITICAL - CONTENT DENSITY RULES:**
1. **FILL THE PAGE:** The resume MUST utilize the full A4 page. Do NOT leave empty space at the bottom.
2. **PROFESSIONAL SUMMARY**: 3-4 sentence comprehensive summary highlighting key qualifications.
3. **WORK EXPERIENCE**: 
   - Select most relevant experiences (up to 3).
   - Generate 4-6 IMPACTFUL bullet points per experience.
   - Each bullet should be 1-2 lines, using the **XYZ Formula**: "Accomplished [X] as measured by [Y] by doing [Z]".
   - Example: "Reduced page load time by 40% (Y) for the dashboard (X) by implementing lazy loading and optimizing database queries (Z)."
   - Incorporate these keywords naturally: ${jobAnalysis.keywords.slice(0, 5).join(", ")}.
4. **SKILLS**: Categorize ALL relevant skills (aim for 15-20 total across categories).
5. **PROJECTS**: Include 2-3 relevant projects with 2-3 bullet points EACH describing achievements.
6. **EDUCATION**: Include all education with relevant coursework if space permits.
7. **CERTIFICATIONS**: Include all relevant certifications.

**PAGE FILLING INSTRUCTION:**
- **CRITICAL:** The user wants a SINGLE FULL PAGE. Do not leave it half empty.
- **IF THE CANDIDATE HAS LIMITED EXPERIENCE:**
  - **EXPAND** on every bullet point. Add detail, context, and impact.
  - Generate **4-6 bullets** for each project instead of 2-3.
  - Include relevant coursework or academic projects to fill space.
- **IF THE CANDIDATE HAS EXTENSIVE EXPERIENCE:**
  - Prioritize the most relevant 3 roles.
  - Use concise 3-4 bullets per role.
  - Ensure it fits on one page.

**CALCULATE ATS SCORE**: 
- Compare the candidate's original profile against the JD.
- Base score on: Keyword match (40%), Skills match (30%), Experience relevance (30%).
- Return a Realistic score (0-100).
- Provide a BREAKDOWN of why this score was given.

**KEYWORD ANALYSIS (REQUIRED)**:
- Extract ALL important keywords from the job description (technologies, skills, tools, methodologies).
- For each keyword found in the resume, track WHERE it appears (summary, experience.0.bullets.1, skills, projects, etc.).
- List keywords from the JD that are NOT in the resume as "missingKeywords".
- Calculate matchPercentage = (matched / total) * 100.

Return ONLY valid JSON with this structure:
{
  "contactInfo": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "City, State",
    "linkedin": "linkedin url or null",
    "github": "github url or null",
    "portfolio": "portfolio url or null"
  },
  "summary": "Rewritten tailored summary",
  "experiences": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "location": "City, State",
      "dateRange": "Month Year - Month Year",
      "bullets": ["Rewritten tailored bullet 1", "Rewritten tailored bullet 2"]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Type",
      "field": "Field of Study",
      "dateRange": "Year",
      "gpa": "GPA or null"
    }
  ],
  "skills": ["Skill 1", "Skill 2"],
  "skillsCategories": {
    "Languages": ["Java", "Python", "JavaScript", "SQL"],
    "Databases": ["MySQL", "PostgreSQL", "MongoDB"],
    "Frameworks": ["React", "Node.js", "Spring MVC"],
    "Tools": ["Git", "Docker", "VS Code", "Postman"],
    "Cloud": ["AWS (S3, EC2)", "Google Cloud"]
  },
  "projects": [
    {
      "name": "Project Name",
      "technologies": "Tech 1, Tech 2",
      "bullets": [
        "Bullet point 1 describing achievement with metrics",
        "Bullet point 2 describing impact",
        "Bullet point 3 describing technical details"
      ],
      "link": "Link or null"
    }
  ],
  "certifications": [
    {
       "name": "Cert Name",
       "issuer": "Issuer",
       "date": "Date"
    }
  ],
  "atsScore": 75,
  "atsScoreBreakdown": {
    "keywordMatch": 35,
    "skillsMatch": 25,
    "formatting": 15,
    "missingKeywords": ["missing1", "missing2"],
    "explanation": "Brief explanation of calculation"
  },
  "keywords": ["matched", "keywords"],
  "keywordAnalysis": {
    "matchedKeywords": [
      {
        "keyword": "React",
        "locations": ["summary", "experience.0.bullets.1", "skills"]
      },
      {
        "keyword": "Node.js",
        "locations": ["experience.0.bullets.2", "skills"]
      }
    ],
    "missingKeywords": ["AWS", "Docker", "CI/CD"],
    "totalJobKeywords": 12,
    "matchPercentage": 67
  }
}`;

    // Helper to try generation with fallback (Same strategy as ResumeParser)
    const generateWithFallback = async () => {
      // Models available per user's rate limits dashboard
      // User suggested 3.0 preview
      const modelsToTry = [
        "gemini-3-flash-preview",
        "models/gemini-3-flash-preview",

        // Flash Lite (Primary preference from user)
        "gemini-2.5-flash-lite",
        "models/gemini-2.5-flash-lite",

        // 3.0 Flash
        "gemini-3.0-flash",
        "models/gemini-3.0-flash",

        // 2.5 Flash
        "gemini-2.5-flash",
        "models/gemini-2.5-flash",

        // 2.0 Flash (Next-gen standard)
        "gemini-2.0-flash",
        "models/gemini-2.0-flash",

        // Fallbacks (1.5 Family)
        "gemini-1.5-flash",
        "models/gemini-1.5-flash",
        "gemini-1.5-pro",
        "models/gemini-1.5-pro",
      ];

      for (const modelName of modelsToTry) {
        try {
          console.log(`Generating resume with model: ${modelName}...`);
          // Use v1 API version
          const currentModel = genAI.getGenerativeModel({ model: modelName });
          const result = await currentModel.generateContent(prompt);
          return result.response.text();
        } catch (error: any) {
          console.log(
            `Failed with ${modelName}: ${error.message?.slice(0, 100)}...`,
          );

          // Run out of quota?
          // Run out of quota?
          if (error.message?.includes("429")) {
            // Try to extract wait time from error message "Please retry in 48.71s"
            const match = error.message.match(/retry in\s+([\d.]+)\s*s/);
            const waitSeconds = match ? parseFloat(match[1]) + 2 : 60; // Add 2s buffer or default to 60s

            console.log(
              `Rate limit (429) hit for ${modelName}. Waiting ${waitSeconds.toFixed(1)}s (dynamic)...`,
            );

            await new Promise((resolve) =>
              setTimeout(resolve, waitSeconds * 1000),
            );

            // Retry the same model once after waiting
            try {
              console.log(`Retrying ${modelName} after wait...`);
              const currentModel = genAI.getGenerativeModel({
                model: modelName,
              });
              const result = await currentModel.generateContent(prompt);
              return result.response.text();
            } catch (retryError) {
              console.log(`Retry failed for ${modelName}: ${retryError}`);
              continue; // Move to next model
            }
          }

          // Model not found?
          if (error.message?.includes("404")) {
            console.log(`Model ${modelName} not found (404). Skipping.`);
            continue;
          }

          // Other errors, continue
        }
      }

      throw new Error("All AI models failed to generate resume.");
    };

    try {
      console.log("Calling AI to generate resume...");
      const response = await generateWithFallback();

      const cleanJson = response
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const parsed = JSON.parse(cleanJson);

      // Debug logging
      console.log("✅ AI Response parsed successfully");
      console.log("   - ATS Score:", parsed.atsScore);
      console.log("   - Keywords count:", parsed.keywords?.length || 0);
      console.log("   - Has keywordAnalysis:", !!parsed.keywordAnalysis);
      console.log(
        "   - Matched keywords:",
        parsed.keywordAnalysis?.matchedKeywords?.length || 0,
      );

      // Ensure keywordAnalysis exists (AI sometimes omits it)
      if (!parsed.keywordAnalysis) {
        console.log("⚠️ keywordAnalysis missing, generating from keywords...");
        parsed.keywordAnalysis = {
          matchedKeywords: (parsed.keywords || []).map((k: string) => ({
            keyword: k,
            locations: ["skills", "summary"],
          })),
          missingKeywords: parsed.atsScoreBreakdown?.missingKeywords || [],
          totalJobKeywords: (parsed.keywords?.length || 0) + 5,
          matchPercentage: parsed.keywords?.length
            ? Math.min(
                85,
                (parsed.keywords.length / (parsed.keywords.length + 5)) * 100,
              )
            : 50,
        };
      }

      // Ensure atsScoreBreakdown exists (AI sometimes omits it)
      if (!parsed.atsScoreBreakdown) {
        console.log("⚠️ atsScoreBreakdown missing, generating from score...");
        const score = parsed.atsScore || 70;
        parsed.atsScoreBreakdown = {
          keywordMatch: Math.round(score * 0.4),
          skillsMatch: Math.round(score * 0.3),
          formatting: Math.round(score * 0.3),
          missingKeywords: parsed.keywordAnalysis?.missingKeywords || [],
          explanation: `Score based on ${parsed.keywords?.length || 0} matched keywords and ${parsed.skills?.length || 0} skills.`,
        };
      }

      return parsed;
    } catch (error: any) {
      console.error("=== AI GENERATION FAILED ===");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Stack:", error.stack?.slice(0, 500));
      console.error("Using fallback basic resume...");
      // Return a basic resume structure from profile data ONLY if all AIs fail
      return this.createBasicResume(profile);
    }
  }

  /**
   * Create a basic resume from profile data (fallback)
   */
  private createBasicResume(profile: ProfileData): GeneratedResume {
    return {
      contactInfo: {
        name: `${profile.firstName} ${profile.lastName}`,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        linkedin: profile.linkedin,
        github: profile.github,
        portfolio: profile.portfolio,
      },
      summary: profile.summary || "",
      experiences: profile.experiences.slice(0, 3).map((exp) => ({
        company: exp.company,
        role: exp.role,
        location: exp.location,
        dateRange: `${exp.startDate} - ${exp.current ? "Present" : exp.endDate}`,
        bullets: exp.bullets.slice(0, 4),
      })),
      education: profile.education.map((edu) => ({
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        dateRange: edu.endDate || "",
        gpa: edu.gpa,
      })),
      skills: profile.skills.map((s) => s.name),
      projects: profile.projects?.map((p) => ({
        name: p.name,
        description: p.description,
        technologies: p.technologies,
        link: p.link,
      })),
      certifications: profile.certifications?.map((c) => ({
        name: c.name,
        issuer: c.issuer,
        date: c.date,
      })),
      atsScore: 70,
      atsScoreBreakdown: {
        keywordMatch: 28,
        skillsMatch: 21,
        formatting: 21,
        missingKeywords: [],
        explanation: "Fallback resume - no AI analysis available.",
      },
      keywords: [],
      keywordAnalysis: {
        matchedKeywords: [],
        missingKeywords: [],
        totalJobKeywords: 0,
        matchPercentage: 0,
      },
    };
  }

  /**
   * Improve a single bullet point
   */
  async improveBulletPoint(bullet: string, context: string): Promise<string> {
    const prompt = `Improve this resume bullet point to be more impactful and ATS-friendly.
    
Context: ${context}
Original: ${bullet}

Rules:
- Start with a strong action verb
- Include metrics/numbers if possible
- Keep it to 1-2 lines
- Make it achievement-focused

Return ONLY the improved bullet point, no quotes or explanation.`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      return bullet;
    }
  }
}

export const geminiService = new GeminiService();
