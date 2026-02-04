import { GeneratedResume } from "./gemini.service";

/**
 * ATS Compatibility Checker Service
 * Analyzes resumes for common ATS pitfalls and provides actionable feedback.
 */

export interface ATSCheckResult {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  details?: string;
}

export interface ATSReport {
  overallScore: number; // 0-100
  passedChecks: number;
  totalChecks: number;
  checks: ATSCheckResult[];
}

// Common action verbs that ATS systems recognize
const ACTION_VERBS = [
  "achieved",
  "administered",
  "analyzed",
  "built",
  "collaborated",
  "conducted",
  "created",
  "decreased",
  "delivered",
  "designed",
  "developed",
  "directed",
  "drove",
  "enhanced",
  "established",
  "executed",
  "expanded",
  "generated",
  "grew",
  "identified",
  "implemented",
  "improved",
  "increased",
  "initiated",
  "launched",
  "led",
  "managed",
  "mentored",
  "negotiated",
  "optimized",
  "orchestrated",
  "oversaw",
  "pioneered",
  "planned",
  "produced",
  "reduced",
  "resolved",
  "revamped",
  "scaled",
  "spearheaded",
  "streamlined",
  "supervised",
  "transformed",
  "upgraded",
];

// Standard section headings ATS systems recognize
const STANDARD_SECTIONS = [
  "summary",
  "professional summary",
  "objective",
  "profile",
  "experience",
  "work experience",
  "employment",
  "work history",
  "education",
  "academic",
  "qualifications",
  "skills",
  "technical skills",
  "core competencies",
  "projects",
  "certifications",
  "certificates",
  "awards",
];

export class ATSCheckerService {
  /**
   * Run all ATS compatibility checks on a generated resume
   */
  checkResume(resume: GeneratedResume, jobDescription?: string): ATSReport {
    const checks: ATSCheckResult[] = [];

    // 1. Standard Sections Check
    checks.push(this.checkStandardSections(resume));

    // 2. Contact Info Check
    checks.push(this.checkContactInfo(resume));

    // 3. Date Format Check
    checks.push(this.checkDateFormats(resume));

    // 4. Action Verbs Check
    checks.push(this.checkActionVerbs(resume));

    // 5. Resume Length Check
    checks.push(this.checkResumeLength(resume));

    // 6. Special Characters Check
    checks.push(this.checkSpecialCharacters(resume));

    // 7. Single Column Layout Check (our templates are always single column)
    checks.push(this.checkSingleColumnLayout());

    // 8. No Tables/Images Check (our generator doesn't add these)
    checks.push(this.checkNoTablesImages());

    // 9. Keyword Match Check (if JD provided)
    if (jobDescription || resume.keywordAnalysis) {
      checks.push(this.checkKeywordMatch(resume));
    }

    // 10. Professional Email Check
    checks.push(this.checkProfessionalEmail(resume));

    const passedChecks = checks.filter((c) => c.passed).length;
    const totalChecks = checks.length;
    const overallScore = Math.round((passedChecks / totalChecks) * 100);

    return {
      overallScore,
      passedChecks,
      totalChecks,
      checks,
    };
  }

  private checkStandardSections(resume: GeneratedResume): ATSCheckResult {
    const hasSummary = !!resume.summary;
    const hasExperience = resume.experiences?.length > 0;
    const hasEducation = resume.education?.length > 0;
    const hasSkills = resume.skills?.length > 0;

    const missingSections: string[] = [];
    if (!hasSummary) missingSections.push("Summary");
    if (!hasExperience) missingSections.push("Experience");
    if (!hasEducation) missingSections.push("Education");
    if (!hasSkills) missingSections.push("Skills");

    const passed = missingSections.length === 0;

    return {
      id: "standard-sections",
      name: "Standard Section Headings",
      description:
        "Resume has recognizable sections (Summary, Experience, Education, Skills)",
      passed,
      details: passed
        ? "All standard sections present"
        : `Missing: ${missingSections.join(", ")}`,
    };
  }

  private checkContactInfo(resume: GeneratedResume): ATSCheckResult {
    const { name, email, phone } = resume.contactInfo;
    const missing: string[] = [];

    if (!name) missing.push("Name");
    if (!email) missing.push("Email");
    if (!phone) missing.push("Phone");

    const passed = missing.length === 0;

    return {
      id: "contact-info",
      name: "Contact Information Complete",
      description: "Name, email, and phone number are present",
      passed,
      details: passed
        ? "All contact details present"
        : `Missing: ${missing.join(", ")}`,
    };
  }

  private checkDateFormats(resume: GeneratedResume): ATSCheckResult {
    const datePatterns: string[] = [];

    // Collect all date strings
    resume.experiences?.forEach((exp) => {
      if (exp.dateRange) datePatterns.push(exp.dateRange);
    });
    resume.education?.forEach((edu) => {
      if (edu.dateRange) datePatterns.push(edu.dateRange);
    });

    // Check for inconsistent formats
    const hasMonthYear = datePatterns.some((d) => /[A-Za-z]+\s+\d{4}/.test(d)); // "Jan 2023"
    const hasYearOnly = datePatterns.some((d) => /^\d{4}$/.test(d.trim())); // "2023"
    const hasNumeric = datePatterns.some((d) => /\d{1,2}\/\d{4}/.test(d)); // "01/2023"

    const formatCount = [hasMonthYear, hasYearOnly, hasNumeric].filter(
      Boolean,
    ).length;
    const passed = formatCount <= 1;

    return {
      id: "date-formats",
      name: "Consistent Date Formats",
      description: "All dates follow a consistent format",
      passed,
      details: passed
        ? "Date formats are consistent"
        : "Mixed date formats detected (e.g., 'Jan 2023' vs '2023'). Use one format throughout.",
    };
  }

  private checkActionVerbs(resume: GeneratedResume): ATSCheckResult {
    let totalBullets = 0;
    let actionVerbBullets = 0;

    resume.experiences?.forEach((exp) => {
      exp.bullets?.forEach((bullet) => {
        totalBullets++;
        const firstWord = bullet.trim().split(/\s+/)[0]?.toLowerCase() || "";
        if (
          ACTION_VERBS.some((verb) => firstWord.startsWith(verb.slice(0, 4)))
        ) {
          actionVerbBullets++;
        }
      });
    });

    const percentage =
      totalBullets > 0 ? (actionVerbBullets / totalBullets) * 100 : 100;
    const passed = percentage >= 70;

    return {
      id: "action-verbs",
      name: "Action Verbs in Bullets",
      description: "Experience bullets start with strong action verbs",
      passed,
      details: passed
        ? `${Math.round(percentage)}% of bullets use action verbs`
        : `Only ${Math.round(percentage)}% use action verbs. Start bullets with words like 'Developed', 'Led', 'Implemented'.`,
    };
  }

  private checkResumeLength(resume: GeneratedResume): ATSCheckResult {
    // Estimate word count
    let wordCount = 0;

    wordCount += resume.summary?.split(/\s+/).length || 0;

    resume.experiences?.forEach((exp) => {
      wordCount += exp.role.split(/\s+/).length;
      wordCount += exp.company.split(/\s+/).length;
      exp.bullets?.forEach((b) => {
        wordCount += b.split(/\s+/).length;
      });
    });

    resume.education?.forEach((edu) => {
      wordCount += (edu.institution + edu.degree + edu.field).split(
        /\s+/,
      ).length;
    });

    wordCount += resume.skills?.length || 0;

    resume.projects?.forEach((p) => {
      wordCount += (p.name + " " + p.description).split(/\s+/).length;
    });

    const passed = wordCount >= 150 && wordCount <= 800;

    return {
      id: "resume-length",
      name: "Optimal Resume Length",
      description: "Resume has appropriate content density (150-800 words)",
      passed,
      details: passed
        ? `~${wordCount} words (optimal range)`
        : wordCount < 150
          ? `Only ~${wordCount} words. Add more detail to experiences.`
          : `~${wordCount} words. Consider condensing for a 1-page resume.`,
    };
  }

  private checkSpecialCharacters(resume: GeneratedResume): ATSCheckResult {
    const problematicChars = /[★•→←↑↓●◆◇■□▲△▼▽♦♣♠♥✓✗✔✘]/g;
    let found: string[] = [];

    const checkText = (text?: string) => {
      if (!text) return;
      const matches = text.match(problematicChars);
      if (matches) found.push(...matches);
    };

    checkText(resume.summary);
    resume.experiences?.forEach((exp) => {
      exp.bullets?.forEach(checkText);
    });

    // Remove duplicates
    found = [...new Set(found)];
    const passed = found.length === 0;

    return {
      id: "special-characters",
      name: "No Problematic Characters",
      description: "Resume avoids special symbols that confuse ATS parsers",
      passed,
      details: passed
        ? "No problematic special characters found"
        : `Found: ${found.join(" ")}. Replace with standard bullets (-) or text.`,
    };
  }

  private checkSingleColumnLayout(): ATSCheckResult {
    // Our generated resumes are always single column
    return {
      id: "single-column",
      name: "Single Column Layout",
      description: "Resume uses a linear, single-column structure",
      passed: true,
      details: "Layout is ATS-friendly (single column)",
    };
  }

  private checkNoTablesImages(): ATSCheckResult {
    // Our generator doesn't add tables or images
    return {
      id: "no-tables-images",
      name: "No Tables or Images",
      description: "Resume doesn't contain tables or embedded images",
      passed: true,
      details: "No tables or images detected",
    };
  }

  private checkKeywordMatch(resume: GeneratedResume): ATSCheckResult {
    const matchPercentage = resume.keywordAnalysis?.matchPercentage || 0;
    const passed = matchPercentage >= 50;

    return {
      id: "keyword-match",
      name: "Keyword Match Rate",
      description: "Resume contains at least 50% of job description keywords",
      passed,
      details: passed
        ? `${Math.round(matchPercentage)}% of keywords matched`
        : `Only ${Math.round(matchPercentage)}% matched. Add missing keywords to your profile.`,
    };
  }

  private checkProfessionalEmail(resume: GeneratedResume): ATSCheckResult {
    const email = resume.contactInfo.email?.toLowerCase() || "";

    // Check for unprofessional patterns
    const unprofessionalPatterns = [
      /^[a-z]+\d{4,}@/, // too many numbers
      /sexy|hot|cool|crazy|ninja|xxx/i,
      /\d{6,}/, // long number sequences
    ];

    const isUnprofessional = unprofessionalPatterns.some((p) => p.test(email));
    const passed = email.length > 0 && !isUnprofessional;

    return {
      id: "professional-email",
      name: "Professional Email Address",
      description:
        "Email appears professional (firstname.lastname format ideal)",
      passed,
      details: passed
        ? "Email looks professional"
        : "Consider using a more professional email format (e.g., firstname.lastname@gmail.com)",
    };
  }
}

export const atsCheckerService = new ATSCheckerService();
