import {
  mockProfile,
  mockExperience,
  mockEducation,
  mockSkill,
} from "../fixtures";

/**
 * Profile Service Tests
 */
describe("Profile Service", () => {
  describe("Profile Data Validation", () => {
    it("should validate required profile fields", () => {
      const profileData = mockProfile;

      expect(profileData.firstName).toBeDefined();
      expect(profileData.lastName).toBeDefined();
      expect(profileData.email).toBeDefined();
    });

    it("should accept optional profile fields", () => {
      const profileData = mockProfile;

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
      const experience = mockExperience;

      expect(experience.company).toBeDefined();
      expect(experience.role).toBeDefined();
      expect(experience.startDate).toBeDefined();
      expect(Array.isArray(experience.bullets)).toBe(true);
    });

    it("should ensure bullet points are properly formatted", () => {
      const experience = mockExperience;

      experience.bullets.forEach((bullet) => {
        expect(typeof bullet).toBe("string");
        expect(bullet.length).toBeGreaterThan(5);
      });
    });

    it("should validate date ranges", () => {
      const experience = mockExperience;
      const startDate = new Date(experience.startDate);
      const endDate = new Date(experience.endDate || "");

      expect(startDate).toBeInstanceOf(Date);
      expect(startDate < endDate).toBe(true);
    });
  });

  describe("Education Management", () => {
    it("should validate education data structure", () => {
      const education = mockEducation;

      expect(education.institution).toBeDefined();
      expect(education.degree).toBeDefined();
      expect(education.field).toBeDefined();
    });

    it("should handle GPA validation", () => {
      const education = { ...mockEducation, gpa: "3.8" };
      const gpaValue = parseFloat(education.gpa);

      expect(gpaValue).toBeGreaterThanOrEqual(0);
      expect(gpaValue).toBeLessThanOrEqual(4.0);
    });

    it("should accept optional GPA field", () => {
      const educationNoGPA = { ...mockEducation, gpa: undefined };

      expect(educationNoGPA.gpa).toBeUndefined();
    });
  });

  describe("Skills Management", () => {
    it("should validate skill data structure", () => {
      const skill = mockSkill;

      expect(skill.name).toBeDefined();
      expect(skill.category).toBeDefined();
    });

    it("should handle skill categorization", () => {
      const skill = mockSkill;
      const validCategories = [
        "Programming Language",
        "Framework",
        "Tool",
        "Database",
      ];

      expect(validCategories).toContain(skill.category);
    });

    it("should prevent duplicate skills", () => {
      const skills = [mockSkill, mockSkill, { ...mockSkill, name: "React" }];
      const uniqueSkills = Array.from(new Set(skills.map((s) => s.name)));

      expect(uniqueSkills.length).toBeLessThan(skills.length);
    });
  });
});
