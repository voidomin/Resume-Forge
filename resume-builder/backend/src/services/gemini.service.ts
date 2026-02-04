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

    // List of models to try in order
    // Prioritizing models with available quota based on user report
    const modelsToTry = [
      "gemini-2.5-flash-lite-001", // Likely ID for 2.5 Flash Lite
      "gemini-2.5-flash-lite",
      "gemini-3.0-flash-001", // Likely ID for 3.0 Flash
      "gemini-3.0-flash",
      "gemini-2.0-flash-001",
      "gemini-2.0-flash",
    ];

    for (const modelName of modelsToTry) {
      try {
        console.log(`Analyzing JD with model: ${modelName}...`);
        const model = genAI.getGenerativeModel(
          { model: modelName },
          { apiVersion: "v1" },
        );
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
**GOAL: Create a PROFESSIONAL, ONE A4 PAGE RESUME tailored to this job.**

**CRITICAL - CONTENT DENSITY RULES:**
1. **ONE PAGE LIMIT:** The resume MUST fit on a single A4 page. Condense text if necessary.
2. **PROFESSIONAL SUMMARY**: Concise 2-3 sentence summary.
3. **WORK EXPERIENCE**: 
   - Select most relevant experiences (max 3).
   - Generate 3-5 IMPACTFUL bullet points per experience.
   - Keep bullets concise (1-2 lines max).
   - Incorporate these keywords naturally: ${jobAnalysis.keywords.slice(0, 5).join(", ")}.
4. **SKILLS**: Include 8-12 most relevant skills.
5. **PROJECTS**: Include 1-2 relevant projects (short descriptions).
6. **CERTIFICATIONS**: Include top 1-2 certifications only.

**BALANCE INSTRUCTION:**
- If the candidate has LITTLE experience, expand bullets to fill the page.
- If the candidate has EXTENSIVE experience, condense bullets to fit one page.

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
    "github": "github url or null"
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
  "projects": [
    {
      "name": "Project Name",
      "description": "Tailored description...",
      "technologies": "Tech 1, Tech 2",
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
      // List of models to try in order
      // Prioritizing models with available quota based on user report
      const modelsToTry = [
        "gemini-2.5-flash-lite-001", // Likely ID for 2.5 Flash Lite
        "gemini-2.5-flash-lite",
        "gemini-3.0-flash-001", // Likely ID for 3.0 Flash
        "gemini-3.0-flash",
        "gemini-2.0-flash-001",
        "gemini-2.0-flash",
      ];

      for (const modelName of modelsToTry) {
        try {
          console.log(`Generating resume with model: ${modelName}...`);
          // Use v1 API version
          const currentModel = genAI.getGenerativeModel(
            { model: modelName },
            { apiVersion: "v1" },
          );
          const result = await currentModel.generateContent(prompt);
          return result.response.text();
        } catch (error: any) {
          console.log(
            `Failed with ${modelName}: ${error.message?.slice(0, 100)}...`,
          );

          // Run out of quota?
          if (error.message?.includes("429")) {
            console.log(`Rate limit (429) hit for ${modelName}. Waiting 2s...`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            continue;
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
      console.log("=== RAW AI RESPONSE ===");
      console.log("Response length:", response?.length || 0);
      console.log("First 500 chars:", response?.slice(0, 500));
      console.log("Last 200 chars:", response?.slice(-200));
      console.log("=== END RAW RESPONSE ===");

      const cleanJson = response
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      console.log("Cleaned JSON length:", cleanJson.length);
      console.log("Attempting JSON.parse...");

      const parsed = JSON.parse(cleanJson);
      console.log(
        "✅ AI Response parsed successfully! ATS Score:",
        parsed.atsScore,
      );
      console.log("Has keywordAnalysis:", !!parsed.keywordAnalysis);
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
