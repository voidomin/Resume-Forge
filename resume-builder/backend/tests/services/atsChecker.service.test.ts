import { ATSCheckerService } from "../../src/services/atsChecker.service";
import type { GeneratedResume } from "../../src/services/gemini.service";

describe("ATSCheckerService", () => {
  const service = new ATSCheckerService();

  const buildResume = (
    overrides: Partial<GeneratedResume> = {},
  ): GeneratedResume => {
    const longSummary = Array(40)
      .fill("Experienced software engineer")
      .join(" ");

    return {
      contactInfo: {
        name: "John Doe",
        email: "john.doe@gmail.com",
        phone: "555-1234",
        location: "San Francisco, CA",
      },
      summary: longSummary,
      experiences: [
        {
          company: "Tech Corp",
          role: "Senior Engineer",
          location: "San Francisco, CA",
          dateRange: "Jan 2022 - Dec 2024",
          bullets: [
            "Developed scalable services improving performance by 30 percent",
            "Led cross functional team delivering features on time",
            "Implemented CI pipelines and automated testing suites",
          ],
        },
      ],
      education: [
        {
          institution: "State University",
          degree: "Bachelor of Science",
          field: "Computer Science",
          dateRange: "Jan 2018 - May 2022",
        },
      ],
      skills: [
        "TypeScript",
        "React",
        "Node.js",
        "AWS",
        "PostgreSQL",
        "Docker",
      ],
      projects: [
        {
          name: "Analytics Platform",
          description:
            "Built a reporting platform with scalable data pipelines and dashboards",
        },
      ],
      atsScore: 85,
      keywords: ["React", "Node.js"],
      keywordAnalysis: {
        matchedKeywords: [
          { keyword: "React", locations: ["summary"] },
          { keyword: "Node.js", locations: ["experience.0.bullets.0"] },
        ],
        missingKeywords: [],
        totalJobKeywords: 5,
        matchPercentage: 60,
      },
      ...overrides,
    };
  };

  const getCheck = (report: ReturnType<typeof service.checkResume>, id: string) =>
    report.checks.find((check) => check.id === id);

  it("returns a report with expected checks", () => {
    const resume = buildResume();
    const report = service.checkResume(resume, "React Node.js");

    const expectedIds = [
      "standard-sections",
      "contact-info",
      "date-formats",
      "action-verbs",
      "resume-length",
      "special-characters",
      "single-column",
      "no-tables-images",
      "keyword-match",
      "professional-email",
    ];

    expectedIds.forEach((id) => {
      expect(getCheck(report, id)).toBeDefined();
    });

    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
  });

  it("flags missing contact information", () => {
    const resume = buildResume({
      contactInfo: {
        name: "John Doe",
        email: "john.doe@gmail.com",
      },
    });

    const report = service.checkResume(resume, "React");
    const contactCheck = getCheck(report, "contact-info");

    expect(contactCheck?.passed).toBe(false);
    expect(contactCheck?.details).toContain("Phone");
  });

  it("flags mixed date formats", () => {
    const resume = buildResume({
      education: [
        {
          institution: "State University",
          degree: "Bachelor of Science",
          field: "Computer Science",
          dateRange: "2022",
        },
      ],
    });

    const report = service.checkResume(resume, "React");
    const dateCheck = getCheck(report, "date-formats");

    expect(dateCheck?.passed).toBe(false);
  });

  it("flags unprofessional email addresses", () => {
    const resume = buildResume({
      contactInfo: {
        name: "John Doe",
        email: "sexy123456@example.com",
        phone: "555-1234",
      },
    });

    const report = service.checkResume(resume, "React");
    const emailCheck = getCheck(report, "professional-email");

    expect(emailCheck?.passed).toBe(false);
  });

  it("detects problematic special characters", () => {
    const resume = buildResume({
      experiences: [
        {
          company: "Tech Corp",
          role: "Senior Engineer",
          location: "San Francisco, CA",
          dateRange: "Jan 2022 - Dec 2024",
          bullets: ["Developed ★ critical systems for global customers"],
        },
      ],
    });

    const report = service.checkResume(resume, "React");
    const specialCheck = getCheck(report, "special-characters");

    expect(specialCheck?.passed).toBe(false);
  });

  it("fails action verb check with weak bullets", () => {
    const resume = buildResume({
      experiences: [
        {
          company: "Tech Corp",
          role: "Senior Engineer",
          location: "San Francisco, CA",
          dateRange: "Jan 2022 - Dec 2024",
          bullets: [
            "Did tasks assigned by the team",
            "Made changes to existing systems",
          ],
        },
      ],
    });

    const report = service.checkResume(resume, "React");
    const actionCheck = getCheck(report, "action-verbs");

    expect(actionCheck?.passed).toBe(false);
  });

  it("fails resume length check when too short", () => {
    const resume = buildResume({
      summary: "Short summary",
      experiences: [],
      education: [],
      skills: ["React"],
      projects: [],
    });

    const report = service.checkResume(resume, "React");
    const lengthCheck = getCheck(report, "resume-length");

    expect(lengthCheck?.passed).toBe(false);
    expect(lengthCheck?.details).toContain("Only");
  });

  it("omits keyword match check when no job description or keyword analysis", () => {
    const resume = buildResume({ keywordAnalysis: undefined });
    const report = service.checkResume(resume);

    const keywordCheck = getCheck(report, "keyword-match");
    expect(keywordCheck).toBeUndefined();
  });
});
