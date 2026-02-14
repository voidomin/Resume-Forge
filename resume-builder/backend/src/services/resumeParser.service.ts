import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../lib/logger";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Work around pdf-parse ESM/CJS typing mismatch.
const parsePdf = pdfParse as unknown as (buffer: Buffer) => Promise<{ text: string }>;

// API timeout configuration (30 seconds)
const API_TIMEOUT_MS = 30000;

/**
 * Wrapper to add timeout to async API calls
 */
const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number = API_TIMEOUT_MS): Promise<T> => {
  const timeoutPromise = new Promise<T>((_, reject) =>
    setTimeout(() => reject(new Error(`API call timeout after ${timeoutMs}ms`)), timeoutMs),
  );
  return Promise.race([promise, timeoutPromise]);
};

export interface ParsedProfile {
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
  projects: {
    name: string;
    description: string;
    technologies?: string;
    link?: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    date?: string;
    link?: string;
  }[];
}

class ResumeParserService {
  private model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  /**
   * Parse text from PDF file
   */
  async parsePDF(buffer: Buffer): Promise<string> {
    try {
      const data = await parsePdf(buffer);
      return data.text;
    } catch (error) {
      logger.error("PDF parsing error:", error);
      throw new Error("Failed to parse PDF file");
    }
  }

  /**
   * Parse text from DOCX file
   */
  async parseDOCX(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      logger.error("DOCX parsing error:", error);
      throw new Error("Failed to parse DOCX file");
    }
  }

  /**
   * Extract structured profile data from resume text using Gemini AI
   */
  async extractProfileFromText(resumeText: string): Promise<ParsedProfile> {
    logger.debug(
      `Extracted resume text length: ${resumeText.length} characters`,
    );

    // Truncate if too long (Gemini has limits)
    const processedText = resumeText.slice(0, 30000);

    const prompt = `You are a resume parser. Extract structured profile information from the following resume text.

RESUME TEXT:
${processedText}

Extract and return a JSON object with the following structure. Be thorough and extract ALL information available. For dates, use formats like "Jan 2020" or "2020". If information is not available, use null.

{
  "firstName": "string (first name only)",
  "lastName": "string (last name only)", 
  "email": "string (email address)",
  "phone": "string or null (phone number)",
  "location": "string or null (city, state/country)",
  "linkedin": "string or null (LinkedIn URL or username)",
  "github": "string or null (GitHub URL or username)",
  "portfolio": "string or null (portfolio/personal website URL)",
  "summary": "string or null (professional summary or objective if present)",
  "experiences": [
    {
      "company": "string (company name)",
      "role": "string (job title)",
      "location": "string or null (job location)",
      "startDate": "string (e.g. 'Jan 2020')",
      "endDate": "string or null (e.g. 'Dec 2022', null if current)",
      "current": boolean (true if this is current job),
      "bullets": ["array of achievement/responsibility bullet points as strings"]
    }
  ],
  "education": [
    {
      "institution": "string (school/university name)",
      "degree": "string (e.g. 'Bachelor of Science', 'B.S.', 'MBA')",
      "field": "string (field of study, e.g. 'Computer Science')",
      "location": "string or null",
      "startDate": "string or null",
      "endDate": "string or null (graduation year)",
      "gpa": "string or null (GPA if mentioned)"
    }
  ],
  "skills": [
    {
      "name": "string (skill name)",
      "category": "string (one of: 'technical', 'language', 'soft', 'tool', 'framework', 'other')"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string (brief description)",
      "technologies": "string (comma separated)",
      "link": "string (url or null)"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string (organization)",
      "date": "string (year or date)",
      "link": "string (url or null)"
    }
  ]
}

IMPORTANT:
- Extract ALL work experiences, not just recent ones
- Extract ALL education entries
- Extract ALL skills, projects, and certifications
- For bullet points in experiences, keep them as-is with quantifiable metrics if present
- If the resume has a summary/objective section, include it
- Parse dates intelligently (handle various formats)
- Return ONLY valid JSON, no markdown formatting

Return the JSON object:`;

    // Helper to try generation with fallback
    const generateWithFallback = async (retries = 2) => {
      // List of models to try in order
      const modelsToTry = [
        "gemini-2.0-flash-001",
        "gemini-2.0-flash",
        "gemini-2.5-flash",
      ];

      for (const modelName of modelsToTry) {
        try {
        logger.debug(`Attempting with model: ${modelName}...`);
          const currentModel = genAI.getGenerativeModel({ model: modelName });
          const result = await withTimeout(currentModel.generateContent(prompt));
          return result.response.text();
        } catch (error: any) {
          logger.debug(`Failed with ${modelName}: ${error.message}`);

          if (error.message?.includes("429")) {
            logger.debug(`Rate limit hit. Waiting 2s before next model...`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            continue; // Try next model
          }

          // If 404 (not found), just continue to next model
          if (error.message?.includes("404")) {
            continue;
          }
        }
      }

      throw new Error("All AI models failed. Please try again later.");
    };

    try {
      const response = await generateWithFallback();
      logger.debug("Received response from Gemini AI");

      // Extract JSON from response (handle potential markdown code blocks)
      let jsonStr = response;
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      // Clean the JSON string
      jsonStr = jsonStr.trim();

      const parsed = JSON.parse(jsonStr);

      // Validate and provide defaults
      return {
        firstName: parsed.firstName || "",
        lastName: parsed.lastName || "",
        email: parsed.email || "",
        phone: parsed.phone || undefined,
        location: parsed.location || undefined,
        linkedin: parsed.linkedin || undefined,
        github: parsed.github || undefined,
        portfolio: parsed.portfolio || undefined,
        summary: parsed.summary || undefined,
        experiences: (parsed.experiences || []).map((exp: any) => ({
          company: exp.company || "",
          role: exp.role || "",
          location: exp.location || undefined,
          startDate: exp.startDate || "",
          endDate: exp.endDate || undefined,
          current: exp.current || false,
          bullets: Array.isArray(exp.bullets) ? exp.bullets : [],
        })),
        education: (parsed.education || []).map((edu: any) => ({
          institution: edu.institution || "",
          degree: edu.degree || "",
          field: edu.field || "",
          location: edu.location || undefined,
          startDate: edu.startDate || undefined,
          endDate: edu.endDate || undefined,
          gpa: edu.gpa || undefined,
        })),
        skills: (parsed.skills || []).map((skill: any) => ({
          name: typeof skill === "string" ? skill : skill.name || "",
          category: skill.category || "technical",
        })),
        projects: (parsed.projects || []).map((proj: any) => ({
          name: proj.name || "Project",
          description: proj.description || "",
          technologies: proj.technologies || undefined,
          link: proj.link || undefined,
        })),
        certifications: (parsed.certifications || []).map((cert: any) => ({
          name: cert.name || "Certification",
          issuer: cert.issuer || "",
          date: cert.date || undefined,
          link: cert.link || undefined,
        })),
      };
    } catch (error: any) {
      console.error("AI extraction error details:", error);
      // Return specific error message for debugging
      throw new Error(
        `AI Extraction Failed: ${error.message || error.toString()}`,
      );
    }
  }

  /**
   * Parse resume file (PDF or DOCX) and extract profile data
   */
  async parseResume(buffer: Buffer, mimeType: string): Promise<ParsedProfile> {
    let text: string;

    if (mimeType === "application/pdf") {
      text = await this.parsePDF(buffer);
    } else if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    ) {
      text = await this.parseDOCX(buffer);
    } else {
      throw new Error(
        "Unsupported file type. Please upload a PDF or DOCX file.",
      );
    }

    if (!text || text.trim().length < 50) {
      throw new Error(
        "Could not extract enough text from the resume. Please try a different file.",
      );
    }

    return this.extractProfileFromText(text);
  }
}

export const resumeParserService = new ResumeParserService();
