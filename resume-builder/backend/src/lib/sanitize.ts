// Input sanitization utility for API inputs
export const sanitizeInput = {
  /**
   * Sanitize text input - trim and check length
   */
  text: (
    input: string,
    maxLength: number = 5000,
    minLength: number = 1,
  ): string => {
    if (!input || typeof input !== "string") {
      throw new Error("Invalid input: must be a non-empty string");
    }

    const trimmed = input.trim();

    if (trimmed.length < minLength) {
      throw new Error(`Input must be at least ${minLength} characters`);
    }

    if (trimmed.length > maxLength) {
      throw new Error(`Input must not exceed ${maxLength} characters`);
    }

    return trimmed;
  },

  /**
   * Sanitize email address with RFC 5322 validation
   */
  email: (email: string): string => {
    const trimmed = email.trim().toLowerCase();
    
    // Check for empty email
    if (!trimmed) {
      throw new Error("Email is required");
    }
    
    // Check max length (RFC 5321)
    if (trimmed.length > 254) {
      throw new Error("Email must not exceed 254 characters");
    }

    // RFC 5322 simplified pattern for common cases
    // Allows: alphanumeric, dots, hyphens, underscores in local part
    // Domain part must have at least one dot and valid TLD
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(trimmed)) {
      throw new Error("Invalid email format. Example: user@example.com");
    }

    // Additional validation
    const parts = trimmed.split("@");
    if (parts.length !== 2) {
      throw new Error("Email must contain exactly one @ symbol");
    }

    const [localPart, domain] = parts;

    // Local part validation
    if (!localPart || localPart.length > 64) {
      throw new Error("Email local part must be 1-64 characters");
    }

    if (localPart.startsWith(".") || localPart.endsWith(".")) {
      throw new Error("Email local part cannot start or end with a dot");
    }

    if (localPart.includes("..")) {
      throw new Error("Email local part cannot have consecutive dots");
    }

    // Domain validation
    if (!domain || domain.length > 255) {
      throw new Error("Email domain must be 1-255 characters");
    }

    if (domain.startsWith(".") || domain.endsWith(".")) {
      throw new Error("Email domain cannot start or end with a dot");
    }

    if (domain.startsWith("-") || domain.endsWith("-")) {
      throw new Error("Email domain cannot start or end with hyphen");
    }

    return trimmed;
  },

  /**
   * Sanitize job description - trim and validate length
   */
  jobDescription: (input: string): string => {
    return sanitizeInput.text(input, 5000, 10);
  },

  /**
   * Sanitize name fields
   */
  name: (input: string): string => {
    return sanitizeInput.text(input, 100, 1);
  },

  /**
   * Sanitize URLs
   */
  url: (input: string): string => {
    const trimmed = input.trim();

    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      throw new Error("Invalid URL format");
    }
  },
};
