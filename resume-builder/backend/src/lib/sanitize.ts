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
   * Sanitize email address
   */
  email: (email: string): string => {
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
      throw new Error("Invalid email format");
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
