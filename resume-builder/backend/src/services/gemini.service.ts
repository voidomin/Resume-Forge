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

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      // Clean up response - remove markdown code blocks if present
      const cleanJson = response
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Error analyzing job description:", error);
      return {
        requiredSkills: [],
        preferredSkills: [],
        keywords: [],
        experienceLevel: "mid",
        roleTitle: "Software Engineer",
      };
    }
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
**GOAL: Create a PROFESSIONAL, COMPLETE-LOOKING ONE A4 PAGE RESUME that maximizes the candidate's fit for this job.**

**FIRST, ASSESS THE PROFILE:**
- If the candidate has LIMITED data (few experiences, few skills, no projects): EXPAND and ENRICH content to create a substantial resume.
- If the candidate has ABUNDANT data: CONDENSE and SELECT only the most relevant content to fit one page.

**WHEN PROFILE IS SPARSE (limited info), do this:**
1. **EXPAND SUMMARY**: Write a detailed 3-4 sentence professional summary highlighting transferable skills and career objectives.
2. **ENRICH EXPERIENCES**: 
   - Use ALL available experiences.
   - Generate 5-7 DETAILED bullet points per experience with specific metrics, tools, and impact.
   - Each bullet should be 2 lines long, adding context and achievements.
   - Infer additional accomplishments that are reasonable for the role.
3. **ADD TRANSFERABLE SKILLS**: Infer skills from the job description that the candidate likely has based on their experience.
4. **INCLUDE ALL PROJECTS & CERTIFICATIONS**: Use all available projects and certifications with expanded descriptions.
5. **DETAILED EDUCATION**: Include GPA, relevant coursework, honors, or achievements if available.

**WHEN PROFILE IS RICH (lots of info), do this:**
1. **CONCISE SUMMARY**: Keep to 2-3 sentences.
2. **SELECT STRATEGICALLY**: Choose only 2-3 most relevant experiences with 3-4 bullets each.
3. **LIMIT SKILLS**: Include only 10-15 most relevant skills.
4. **SELECTIVE PROJECTS**: Include only 1-2 most relevant projects.
5. **PRIORITIZE**: Summary > Experience > Skills > Education > Projects > Certifications. Skip sections if needed.

**ALWAYS:**
- Use "Result - Action - Context" format with metrics where possible.
- Incorporate these keywords naturally: ${jobAnalysis.keywords.slice(0, 5).join(", ")}.
- Reorder skills by relevance to the job description.
- **THE RESUME SHOULD LOOK COMPLETE AND PROFESSIONAL - not sparse or empty.**

**CALCULATE ATS SCORE**: 
- Compare the candidate's original profile against the JD.
- Base score on: Keyword match (40%), Skills match (30%), Experience relevance (30%).
- Return a Realistic score (0-100).
- Provide a BREAKDOWN of why this score was given.

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
  "keywords": ["matched", "keywords"]
}`;

    // Helper to try generation with fallback (Same strategy as ResumeParser)
    const generateWithFallback = async () => {
      // List of models to try in order
      const modelsToTry = [
        "gemini-2.0-flash-001",
        "gemini-2.0-flash",
        "gemini-2.5-flash",
      ];

      for (const modelName of modelsToTry) {
        try {
          console.log(`Generating resume with model: ${modelName}...`);
          const currentModel = genAI.getGenerativeModel({ model: modelName });
          const result = await currentModel.generateContent(prompt);
          return result.response.text();
        } catch (error: any) {
          console.log(`Failed with ${modelName}: ${error.message}`);

          if (error.message?.includes("429")) {
            console.log(`Rate limit hit. Waiting 2s before next model...`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            continue; // Try next model
          }

          if (error.message?.includes("404")) {
            continue; // Not found, try next
          }

          // Other errors, continue to next model just in case
        }
      }

      throw new Error("All AI models failed to generate resume.");
    };

    try {
      const response = await generateWithFallback();
      const cleanJson = response
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Error generating resume:", error);
      // Return a basic resume structure from profile data ONLY if all AIs fail
      // This explains why the user saw "not tailored" content and "70%" score
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
      atsScore: 70,
      keywords: [],
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
