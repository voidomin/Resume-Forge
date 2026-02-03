import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
}

class ResumeParserService {
  private model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  /**
   * Parse text from PDF file
   */
  async parsePDF(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      console.error("PDF parsing error:", error);
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
      console.error("DOCX parsing error:", error);
      throw new Error("Failed to parse DOCX file");
    }
  }

  /**
   * Extract structured profile data from resume text using Gemini AI
   */
  async extractProfileFromText(resumeText: string): Promise<ParsedProfile> {
    const prompt = `You are a resume parser. Extract structured profile information from the following resume text.

RESUME TEXT:
${resumeText}

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
  ]
}

IMPORTANT:
- Extract ALL work experiences, not just recent ones
- Extract ALL education entries
- Extract ALL skills mentioned anywhere in the resume
- For bullet points in experiences, keep them as-is with quantifiable metrics if present
- If the resume has a summary/objective section, include it
- Parse dates intelligently (handle various formats)
- Return ONLY valid JSON, no markdown formatting

Return the JSON object:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

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
      };
    } catch (error) {
      console.error("AI extraction error:", error);
      throw new Error("Failed to extract profile information from resume");
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
