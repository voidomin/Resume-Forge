"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fixtures_1 = require("../fixtures");
/**
 * Profile Service Tests
 */
describe("Profile Service", () => {
    describe("Profile Data Validation", () => {
        it("should validate required profile fields", () => {
            const profileData = fixtures_1.mockProfile;
            expect(profileData.firstName).toBeDefined();
            expect(profileData.lastName).toBeDefined();
            expect(profileData.email).toBeDefined();
        });
        it("should accept optional profile fields", () => {
            const profileData = fixtures_1.mockProfile;
            expect(profileData.linkedin).toBeDefined();
            expect(profileData.github).toBeDefined();
            expect(profileData.portfolio).toBeDefined();
        });
        it("should handle email validation", () => {
            const validEmail = "john.doe@example.com";
            const invalidEmail = "not-an-email";
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            expect(emailRegex.test(validEmail)).toBe(true);
            expect(emailRegex.test(invalidEmail)).toBe(false);
        });
    });
    describe("Experience Management", () => {
        it("should validate experience data structure", () => {
            const experience = fixtures_1.mockExperience;
            expect(experience.company).toBeDefined();
            expect(experience.role).toBeDefined();
            expect(experience.startDate).toBeDefined();
            expect(Array.isArray(experience.bullets)).toBe(true);
        });
        it("should ensure bullet points are properly formatted", () => {
            const experience = fixtures_1.mockExperience;
            experience.bullets.forEach((bullet) => {
                expect(typeof bullet).toBe("string");
                expect(bullet.length).toBeGreaterThan(5);
            });
        });
        it("should validate date ranges", () => {
            const experience = fixtures_1.mockExperience;
            const startDate = new Date(experience.startDate);
            const endDate = new Date(experience.endDate || "");
            expect(startDate).toBeInstanceOf(Date);
            expect(startDate < endDate).toBe(true);
        });
    });
    describe("Education Management", () => {
        it("should validate education data structure", () => {
            const education = fixtures_1.mockEducation;
            expect(education.institution).toBeDefined();
            expect(education.degree).toBeDefined();
            expect(education.field).toBeDefined();
        });
        it("should handle GPA validation", () => {
            const education = { ...fixtures_1.mockEducation, gpa: "3.8" };
            const gpaValue = parseFloat(education.gpa);
            expect(gpaValue).toBeGreaterThanOrEqual(0);
            expect(gpaValue).toBeLessThanOrEqual(4.0);
        });
        it("should accept optional GPA field", () => {
            const educationNoGPA = { ...fixtures_1.mockEducation };
            delete educationNoGPA.gpa;
            expect(educationNoGPA).not.toHaveProperty("gpa");
        });
    });
    describe("Skills Management", () => {
        it("should validate skill data structure", () => {
            const skill = fixtures_1.mockSkill;
            expect(skill.name).toBeDefined();
            expect(skill.category).toBeDefined();
        });
        it("should handle skill categorization", () => {
            const skill = fixtures_1.mockSkill;
            const validCategories = [
                "Programming Language",
                "Framework",
                "Tool",
                "Database",
            ];
            expect(validCategories).toContain(skill.category);
        });
        it("should prevent duplicate skills", () => {
            const skills = [fixtures_1.mockSkill, fixtures_1.mockSkill, { ...fixtures_1.mockSkill, name: "React" }];
            const uniqueSkills = Array.from(new Set(skills.map((s) => s.name)));
            expect(uniqueSkills.length).toBeLessThan(skills.length);
        });
    });
});
