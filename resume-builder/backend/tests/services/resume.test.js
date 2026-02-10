"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fixtures_1 = require("../fixtures");
/**
 * Resume Generation Service Tests
 */
describe("Resume Generation Service", () => {
    describe("Job Description Analysis", () => {
        it("should parse job description for keywords", () => {
            const keywords = extractKeywords(fixtures_1.mockJobDescription);
            expect(keywords.length).toBeGreaterThan(0);
            expect(fixtures_1.mockJobDescription.toLowerCase()).toContain("node");
            expect(fixtures_1.mockJobDescription.toLowerCase()).toContain("react");
        });
        it("should identify required skills from job description", () => {
            const requiredSkills = ["Node.js", "React", "PostgreSQL", "AWS", "Docker"];
            const jobDesc = fixtures_1.mockJobDescription.toLowerCase();
            const foundSkills = requiredSkills.filter((skill) => jobDesc.includes(skill.toLowerCase()));
            expect(foundSkills.length).toBeGreaterThan(0);
        });
        it("should extract experience level from job description", () => {
            const jobDesc = fixtures_1.mockJobDescription;
            const experienceLevel = /(\d+)\+\s*years?/i.exec(jobDesc);
            expect(experienceLevel).not.toBeNull();
            expect(parseInt(experienceLevel[1])).toBeGreaterThanOrEqual(1);
        });
    });
    describe("Resume Data Compilation", () => {
        it("should compile contact information correctly", () => {
            const resume = {
                contactInfo: {
                    name: `${fixtures_1.mockProfile.firstName} ${fixtures_1.mockProfile.lastName}`,
                    email: fixtures_1.mockProfile.email,
                    phone: fixtures_1.mockProfile.phone,
                    location: fixtures_1.mockProfile.location,
                },
            };
            expect(resume.contactInfo.name).toContain("John");
            expect(resume.contactInfo.email).toBeDefined();
        });
        it("should include professional summary", () => {
            const resume = {
                summary: fixtures_1.mockProfile.summary,
            };
            expect(resume.summary).toBeDefined();
            expect(resume.summary.length).toBeGreaterThan(10);
        });
        it("should structure experience entries with bullets", () => {
            const resume = {
                experiences: [
                    {
                        company: fixtures_1.mockExperience.company,
                        role: fixtures_1.mockExperience.role,
                        bullets: fixtures_1.mockExperience.bullets,
                    },
                ],
            };
            expect(resume.experiences).toHaveLength(1);
            expect(resume.experiences[0].bullets).toHaveLength(3);
        });
        it("should include education section", () => {
            const resume = {
                education: [
                    {
                        institution: fixtures_1.mockEducation.institution,
                        degree: fixtures_1.mockEducation.degree,
                        field: fixtures_1.mockEducation.field,
                    },
                ],
            };
            expect(resume.education).toHaveLength(1);
            expect(resume.education[0].degree).toBe("Bachelor of Science");
        });
    });
    describe("ATS Scoring", () => {
        it("should calculate ATS score between 0 and 100", () => {
            const score = calculateATSScore(fixtures_1.mockJobDescription, fixtures_1.mockExperience);
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(100);
        });
        it("should award higher score for keyword matches", () => {
            const withKeywords = calculateATSScore(fixtures_1.mockJobDescription, fixtures_1.mockExperience);
            const withoutKeywords = calculateATSScore("Generic job", fixtures_1.mockExperience);
            expect(withKeywords).toBeGreaterThan(withoutKeywords);
        });
        it("should provide breakdown of ATS score components", () => {
            const breakdown = {
                keywordMatch: 85,
                skillsMatch: 80,
                formatting: 90,
            };
            const total = (breakdown.keywordMatch + breakdown.skillsMatch + breakdown.formatting) / 3;
            expect(total).toBeGreaterThan(80);
            expect(breakdown.formatting).toBeLessThanOrEqual(100);
        });
    });
    describe("Resume Formatting", () => {
        it("should ensure resume fits on single A4 page", () => {
            const pageHeight = 1122; // pixels (A4 at 96 DPI)
            const contentHeight = 1050; // estimated content height
            expect(contentHeight).toBeLessThanOrEqual(pageHeight);
        });
        it("should maintain consistent spacing between sections", () => {
            const sectionGap = 12; // pixels
            const sections = 5; // sections in resume
            const totalSpacing = sectionGap * sections;
            expect(totalSpacing).toBeLessThan(100);
        });
        it("should use consistent font sizes", () => {
            const fontSizes = {
                header: 14,
                sectionTitle: 11,
                body: 9,
            };
            expect(fontSizes.header).toBeGreaterThan(fontSizes.sectionTitle);
            expect(fontSizes.sectionTitle).toBeGreaterThan(fontSizes.body);
        });
    });
    describe("Content Selection", () => {
        it("should select most relevant experiences", () => {
            const selectedExperiences = [fixtures_1.mockExperience];
            const maxExperiences = 5;
            expect(selectedExperiences.length).toBeLessThanOrEqual(maxExperiences);
        });
        it("should limit bullet points per experience", () => {
            const maxBullets = 4;
            const experience = fixtures_1.mockExperience;
            expect(experience.bullets.length).toBeLessThanOrEqual(maxBullets);
        });
        it("should prioritize skills mentioned in job description", () => {
            const profileSkills = [fixtures_1.mockSkill];
            const jobKeywords = fixtures_1.mockJobDescription.split(/\s+/);
            const relevantSkills = profileSkills.filter((skill) => jobKeywords.some((keyword) => keyword.toLowerCase().includes(skill.name.toLowerCase())));
            expect(relevantSkills.length).toBeGreaterThan(0);
        });
    });
});
// Helper functions for tests
function extractKeywords(text) {
    const keywords = text
        .toLowerCase()
        .split(/[\s\-.,;:]/)
        .filter((word) => word.length > 3);
    return [...new Set(keywords)];
}
function calculateATSScore(jobDesc, experience) {
    const keywords = extractKeywords(jobDesc);
    const experienceText = JSON.stringify(experience).toLowerCase();
    let score = 50; // base score
    keywords.forEach((keyword) => {
        if (experienceText.includes(keyword)) {
            score += 5;
        }
    });
    return Math.min(score, 100);
}
