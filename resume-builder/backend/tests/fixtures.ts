import jwt from "jsonwebtoken";

/**
 * Generate a test JWT token
 */
export function generateTestToken(userId: string) {
  const secret = process.env.JWT_SECRET || "test-secret";
  return jwt.sign(
    {
      userId,
      email: "test@example.com",
    },
    secret,
    { expiresIn: "1h" },
  );
}

/**
 * Mock user data for tests
 */
export const mockUsers = {
  testUser: {
    id: "test-user-1",
    email: "test@example.com",
    password: "hashedPassword123",
  },
  newUser: {
    email: "newuser@example.com",
    password: "Password123!",
  },
};

/**
 * Mock profile data
 */
export const mockProfile = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "555-1234",
  location: "San Francisco, CA",
  linkedin: "https://linkedin.com/in/johndoe",
  github: "https://github.com/johndoe",
  portfolio: "https://johndoe.dev",
  summary: "Experienced software engineer",
};

/**
 * Mock experience data
 */
export const mockExperience = {
  company: "Tech Corp",
  role: "Senior Engineer",
  location: "San Francisco, CA",
  startDate: "2020-01-15",
  endDate: "2023-12-31",
  current: false,
  bullets: [
    "Led team of 5 engineers",
    "Architected microservices with Node.js",
    "Improved performance by 40%",
  ],
};

/**
 * Mock education data
 */
export const mockEducation = {
  institution: "State University",
  degree: "Bachelor of Science",
  field: "Computer Science",
  startDate: "2015-09-01",
  endDate: "2019-05-31",
  gpa: "3.8",
};

/**
 * Mock skill data
 */
export const mockSkill = {
  name: "TypeScript",
  category: "Programming Language",
  proficiency: "expert",
};

/**
 * Mock job description for resume generation
 */
export const mockJobDescription =
  `Senior Full-Stack Engineer needed for a growing startup.

Requirements:
- 5+ years of experience with Node.js and React
- Experience with PostgreSQL and microservices
- Knowledge of AWS and Docker
- Strong TypeScript skills
- Experience with REST APIs

Responsibilities:
- Design and implement backend services
- Build responsive frontend components
- Mentor junior engineers
- Participate in code reviews

Benefits:
- Competitive salary
- Remote work
- Health insurance
- Professional development budget`;

/**
 * Mock ATS report
 */
export const mockATSReport = {
  score: 85,
  breakdown: {
    keywordMatch: 90,
    skillsMatch: 80,
    formatting: 85,
  },
  missingKeywords: ["Kubernetes", "Terraform"],
};
