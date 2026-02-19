import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import path from "path";
import { logger } from "../lib/logger";

config({ path: path.resolve(__dirname, "../../.env") });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// API timeout configuration (30 seconds)
const API_TIMEOUT_MS = 30000;

/**
 * Wrapper to add timeout to async API calls
 */
const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = API_TIMEOUT_MS,
): Promise<T> => {
  const timeoutPromise = new Promise<T>((_, reject) =>
    setTimeout(
      () => reject(new Error(`API call timeout after ${timeoutMs}ms`)),
      timeoutMs,
    ),
  );
  return Promise.race([promise, timeoutPromise]);
};

const extractGeminiErrorInfo = (error: any) => {
  return {
    status: error?.status || error?.response?.status || error?.code,
    statusText: error?.statusText || error?.response?.statusText,
    message: error?.message,
    details:
      error?.response?.data || error?.error?.message || error?.error?.details,
  };
};

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
  // Optional sections
  coursework?: {
    courseName: string;
    topic: string;
    institution?: string;
  }[];
  leadership?: {
    title: string;
    organization: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }[];
  awards?: {
    awardName: string;
    organization: string;
    awardDate: string;
    description?: string;
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
  // Optional sections (included only if relevant to JD)
  coursework?: {
    courseName: string;
    topic: string;
    institution?: string;
  }[];
  leadership?: {
    title: string;
    organization: string;
    location?: string;
    dateRange?: string;
    description?: string;
  }[];
  awards?: {
    awardName: string;
    organization: string;
    awardDate: string;
    description?: string;
  }[];
  modelUsed?: string;
  generationMethod?: "ai" | "fallback"; // Track if AI was used or fallback
  failureReason?: string; // Reason if fallback was used (e.g., "quota_exceeded", "all_models_failed")
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
  private primaryModel = "gemini-2.5-flash";
  private fallbackModels = [
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-2.0-flash",
    "gemini-3-flash-preview",
    "gemini-3-pro-preview",
  ];

  /**
   * Analyze job description and extract key requirements
   */
  async analyzeJobDescription(jobDescription: string): Promise<{
    requiredSkills: string[];
    preferredSkills: string[];
    keywords: string[];
    experienceLevel: string;
    roleTitle: string;
    modelUsed: string;
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

    const modelsToTry = [this.primaryModel, ...this.fallbackModels];

    for (const modelName of modelsToTry) {
      try {
        logger.debug(`Analyzing JD with model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await withTimeout(model.generateContent(prompt));
        const response = result.response.text();
        const cleanJson = response
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        const parsed = JSON.parse(cleanJson);
        logger.debug(`✅ JD analysis successful with ${modelName}`);
        return { ...parsed, modelUsed: modelName };
      } catch (error: any) {
        const info = extractGeminiErrorInfo(error);
        logger.debug(
          `JD analysis failed with ${modelName}: ${info.message?.slice(0, 100)}...`,
        );
        logger.debug(`Gemini error info:`, info);
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
      modelUsed: "fallback-default",
    };
  }

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

OPTIONAL SECTIONS:

RELEVANT COURSEWORK:
${
  profile.coursework
    ?.map(
      (c) => `
Course: ${c.courseName}
Topic: ${c.topic}
Institution: ${c.institution || "N/A"}
`,
    )
    .join("\n") || "None provided"
}

LEADERSHIP/EXTRACURRICULAR:
${
  profile.leadership
    ?.map(
      (l) => `
Title: ${l.title}
Organization: ${l.organization}
Location: ${l.location || "N/A"}
Dates: ${l.startDate || "N/A"} - ${l.current ? "Present" : l.endDate || "N/A"}
Description: ${l.description || "N/A"}
`,
    )
    .join("\n") || "None provided"
}

HONORS & AWARDS:
${
  profile.awards
    ?.map(
      (a) => `
Award: ${a.awardName}
Organization: ${a.organization}
Date: ${a.awardDate}
Description: ${a.description || "N/A"}
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

**CRITICAL SELECTION RULE:**
The candidate has provided ALL their experiences, projects, skills, and certifications.
You MUST analyze the job description and SELECT ONLY the items that are MOST RELEVANT to this specific role.

DO NOT simply take the first N items from each list. ANALYZE each item for relevance to the job requirements and select accordingly.

**CRITICAL - SINGLE PAGE ENFORCEMENT:**
1. **CONTENT VOLUME**: If the candidate has many experiences, you MUST SELECT the 3 MOST RELEVANT ones based on the job requirements and use NO MORE THAN 3 bullets per role to ensure it fits on one page.
2. **PROFESSIONAL SUMMARY**: Max 3 sentences. Tailor to emphasize skills and experience that match the job description.
3. **WORK EXPERIENCE**: 
   - SELECT the most relevant work experiences that demonstrate the required skills
   - Each bullet must be 1 line if possible. Use the **XYZ Formula**.
   - Incorporate these keywords: ${jobAnalysis.keywords.slice(0, 5).join(", ")}.
4. **SKILLS**: SELECT and group ONLY the skills most relevant to the job description. Prioritize required skills from the JD: ${jobAnalysis.requiredSkills.slice(0, 10).join(", ")}. Group into max 5 categories with 4-5 skills each.
5. **PROJECTS**: SELECT the 2 MOST RELEVANT projects that best demonstrate the required skills and technologies mentioned in the job description. Include 2 bullets each highlighting achievements with metrics.
6. **EDUCATION**: Concise 1-line per degree. Include ALL degrees.
7. **CERTIFICATIONS**: If the candidate has certifications, include ONLY those directly relevant to the job description (max 3). Certifications that demonstrate required skills or industry knowledge should be prioritized.

**PAGE FIT HEURISTIC:**
- Total bullet points across all sections should not exceed 15-18 to guarantee layout stability on a single A4 page.
- Do NOT hallucinate content to "fill space" unless the candidate has almost no history. Prioritize white space over overflow.

**OPTIONAL SECTIONS INCLUSION LOGIC (IMPORTANT):**
Score the relevance of each optional section to the job description:

1. **RELEVANT COURSEWORK**: Include ONLY if you find classes/topics in the candidate's coursework that directly relate to technologies, methodologies, or domains mentioned in the JD.
   - Score calculation: Count matching keywords between coursework topics and JD (0-100)
   - INCLUDE if score ≥ 60
   - If included: Show 2-3 most relevant courses focused on JD-matching topics

2. **LEADERSHIP/EXTRACURRICULAR**: Include ONLY if the roles demonstrate skills or experience highly relevant to the target role (e.g., teamwork, leadership, domain expertise, project management).
   - Score calculation: Keywords related to leadership, team, project, domain (0-100)
   - INCLUDE if score ≥ 70
   - If included: Select 1-2 most relevant roles, 2-3 bullets each describing impact and relevance

3. **HONORS & AWARDS**: Include ONLY if awards are prestigious, domain-specific, or directly demonstrate competency in areas required by the job.
   - Score calculation: Keywords related to recognition, achievement, expertise (0-100)
   - INCLUDE if score ≥ 75
   - If included: Show 2-3 most impressive or relevant awards

**DO NOT include optional sections unless they meet the score threshold. An empty optional section is worse than no section at all.**

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
  },
  "coursework": [
    {
      "courseName": "Course Name",
      "topic": "Topic/Subject",
      "institution": "School/University"
    }
  ],
  "leadership": [
    {
      "title": "Role Title",
      "organization": "Organization Name",
      "location": "City, State",
      "dateRange": "Month Year - Month Year or Present",
      "description": "Description of role and impact"
    }
  ],
  "awards": [
    {
      "awardName": "Award Name",
      "organization": "Organization",
      "awardDate": "Date",
      "description": "Context/significance"
    }
  ]
}`;

    const generateWithFallback = async () => {
      const modelsToTry = [this.primaryModel, ...this.fallbackModels];

      for (const modelName of modelsToTry) {
        try {
          logger.debug(`Generating resume with model: ${modelName}...`);
          const currentModel = genAI.getGenerativeModel({ model: modelName });
          const result = await withTimeout(
            currentModel.generateContent(prompt),
          );
          return { response: result.response.text(), modelUsed: modelName };
        } catch (error: any) {
          const info = extractGeminiErrorInfo(error);
          logger.warn(
            `Failed with ${modelName}: ${info.message?.slice(0, 200)}...`,
          );
          logger.warn("Gemini error info:", info);

          if (error.message?.includes("429")) {
            const match = error.message.match(/retry in\s+([\d.]+)\s*s/);
            const waitSeconds = match ? parseFloat(match[1]) + 2 : 5;
            logger.debug(
              `Rate limit (429) hit for ${modelName}. Waiting ${waitSeconds.toFixed(
                1,
              )}s...`,
            );
            await new Promise((resolve) =>
              setTimeout(resolve, waitSeconds * 1000),
            );
            // Retry the same model once
            try {
              logger.debug(`Retrying ${modelName} after wait...`);
              const retryModel = genAI.getGenerativeModel({ model: modelName });
              const result = await withTimeout(
                retryModel.generateContent(prompt),
              );
              return { response: result.response.text(), modelUsed: modelName };
            } catch (retryError) {
              continue;
            }
          }
          if (error.message?.includes("404")) continue;
        }
      }
      logger.error("CRITICAL: All AI models failed to generate content.");
      throw new Error("All AI models failed to generate resume.");
    };

    try {
      const { response, modelUsed } = await generateWithFallback();
      const cleanJson = response
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const parsed = JSON.parse(cleanJson);
      parsed.modelUsed = modelUsed;
      parsed.generationMethod = "ai"; // Mark as AI-generated

      if (!parsed.keywordAnalysis) {
        parsed.keywordAnalysis = {
          matchedKeywords: (parsed.keywords || []).map((k: string) => ({
            keyword: k,
            locations: ["skills", "summary"],
          })),
          missingKeywords: parsed.atsScoreBreakdown?.missingKeywords || [],
          totalJobKeywords: (parsed.keywords?.length || 0) + 5,
          matchPercentage: 50,
        };
      }

      if (!parsed.atsScoreBreakdown) {
        const score = parsed.atsScore || 70;
        parsed.atsScoreBreakdown = {
          keywordMatch: Math.round(score * 0.4),
          skillsMatch: Math.round(score * 0.3),
          formatting: Math.round(score * 0.3),
          missingKeywords: parsed.keywordAnalysis?.missingKeywords || [],
          explanation: "Generated based on candidate profile.",
        };
      }

      return parsed;
    } catch (error: any) {
      console.error("=== AI GENERATION FAILED ===", error.message);
      const fallbackResume = this.createBasicResume(profile);
      fallbackResume.generationMethod = "fallback";
      fallbackResume.failureReason = error.message?.includes("429")
        ? "quota_exceeded"
        : "all_models_failed";
      return fallbackResume;
    }
  }

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
      coursework: profile.coursework?.slice(0, 3).map((cw) => ({
        courseName: cw.courseName,
        topic: cw.topic,
        institution: cw.institution,
      })),
      leadership: profile.leadership?.slice(0, 2).map((l) => ({
        title: l.title,
        organization: l.organization,
        location: l.location,
        dateRange: `${l.startDate || "N/A"} - ${l.current ? "Present" : l.endDate || "N/A"}`,
        description: l.description,
      })),
      awards: profile.awards?.slice(0, 3).map((a) => ({
        awardName: a.awardName,
        organization: a.organization,
        awardDate: a.awardDate,
        description: a.description,
      })),
      atsScore: 70,
      keywords: [],
      modelUsed: "fallback-basic",
      generationMethod: "fallback" as const,
    };
  }

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
      const model = genAI.getGenerativeModel({ model: this.primaryModel });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      return bullet;
    }
  }
}

export const geminiService = new GeminiService();
