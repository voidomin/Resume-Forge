/**
 * Utility and Helper Function Tests
 */
describe("Utility Functions", () => {
  describe("Date Formatting", () => {
    it("should format date correctly", () => {
      const date = new Date("2023-06-15");
      const formatted = formatDate(date);

      expect(formatted).toMatch(/Jun.*2023/);
    });

    it("should handle null dates", () => {
      const formatted = formatDate(null);

      expect(formatted).toBe("Present");
    });
  });

  describe("Text Truncation", () => {
    it("should truncate long text with ellipsis", () => {
      const longText = "This is a very long string that should be truncated";
      const truncated = truncateText(longText, 20);

      expect(truncated.length).toBeLessThanOrEqual(23); // 20 + "..."
      expect(truncated).toMatch(/\.\.\.$/);
    });

    it("should not truncate short text", () => {
      const shortText = "Short";
      const truncated = truncateText(shortText, 20);

      expect(truncated).toBe("Short");
    });
  });

  describe("JSON Validation", () => {
    it("should validate valid JSON", () => {
      const validJSON = { name: "John", age: 30 };
      const isValid = isValidJSON(JSON.stringify(validJSON));

      expect(isValid).toBe(true);
    });

    it("should reject invalid JSON", () => {
      const invalidJSON = "{ invalid json }";
      const isValid = isValidJSON(invalidJSON);

      expect(isValid).toBe(false);
    });
  });

  describe("String Sanitization", () => {
    it("should remove special characters", () => {
      const input = "Hello<script>alert('XSS')</script>World";
      const sanitized = sanitizeString(input);

      expect(sanitized).not.toContain("<script>");
      expect(sanitized).toContain("Hello");
    });

    it("should handle empty strings", () => {
      const sanitized = sanitizeString("");

      expect(sanitized).toBe("");
    });
  });

  describe("Array Operations", () => {
    it("should remove duplicates from array", () => {
      const arr = ["a", "b", "a", "c", "b"];
      const unique = removeDuplicates(arr);

      expect(unique).toHaveLength(3);
      expect(unique).toContain("a");
    });

    it("should flatten nested arrays", () => {
      const nested = [[1, 2], [3, 4], [5, 6]];
      const flattened = flattenArray(nested);

      expect(flattened).toHaveLength(6);
      expect(flattened).toContain(3);
    });
  });

  describe("Number Operations", () => {
    it("should round numbers correctly", () => {
      const num = 3.14159;
      const rounded = roundNumber(num, 2);

      expect(rounded).toBe(3.14);
    });

    it("should clamp number between min and max", () => {
      expect(clampNumber(5, 1, 10)).toBe(5);
      expect(clampNumber(15, 1, 10)).toBe(10);
      expect(clampNumber(-5, 1, 10)).toBe(1);
    });
  });

  describe("Object Operations", () => {
    it("should deep clone objects", () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = deepClone(original);

      cloned.b.c = 3;

      expect(original.b.c).toBe(2);
      expect(cloned.b.c).toBe(3);
    });

    it("should merge objects deeply", () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { b: { d: 3 }, e: 4 };
      const merged = deepMerge(obj1, obj2);

      expect(merged.a).toBe(1);
      expect(merged.b.c).toBe(2);
      expect(merged.b.d).toBe(3);
      expect(merged.e).toBe(4);
    });
  });
});

// Helper function implementations
function formatDate(date: Date | null): string {
  if (!date) return "Present";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
  }).format(date);
}

function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

function sanitizeString(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

function removeDuplicates<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function flattenArray(arr: any[]): any[] {
  return arr.flat();
}

function roundNumber(num: number, decimals: number): number {
  return Number(Math.round(Number(num + "e" + decimals)) + "e-" + decimals);
}

function clampNumber(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

function deepClone(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}

function deepMerge(obj1: any, obj2: any): any {
  const result = { ...obj1 };
  for (const key in obj2) {
    if (obj2[key] && typeof obj2[key] === "object") {
      result[key] = deepMerge(result[key] || {}, obj2[key]);
    } else {
      result[key] = obj2[key];
    }
  }
  return result;
}
