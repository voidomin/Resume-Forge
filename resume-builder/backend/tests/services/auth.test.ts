import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * Auth Service Tests
 */
describe("Authentication Service", () => {
  describe("Password Hashing", () => {
    it("should hash a password correctly", async () => {
      const password = "TestPassword123!";
      const hashedPassword = await bcrypt.hash(password, 10);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(20);
    });

    it("should verify a correct password", async () => {
      const password = "TestPassword123!";
      const hashedPassword = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare(password, hashedPassword);

      expect(isValid).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const password = "TestPassword123!";
      const wrongPassword = "WrongPassword!";
      const hashedPassword = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare(wrongPassword, hashedPassword);

      expect(isValid).toBe(false);
    });
  });

  describe("JWT Token Generation", () => {
    it("should generate a valid JWT token", () => {
      const secret = "test-secret-key-minimum-32-characters-long";
      const payload = { userId: "user-123", email: "test@example.com" };

      const token = jwt.sign(payload, secret, { expiresIn: "1h" });

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should verify and decode a valid JWT token", () => {
      const secret = "test-secret-key-minimum-32-characters-long";
      const payload = { userId: "user-123", email: "test@example.com" };

      const token = jwt.sign(payload, secret, { expiresIn: "1h" });
      const decoded = jwt.verify(token, secret) as any;

      expect(decoded.userId).toBe("user-123");
      expect(decoded.email).toBe("test@example.com");
    });

    it("should reject an invalid JWT token", () => {
      const secret = "test-secret-key-minimum-32-characters-long";
      const invalidToken = "invalid.token.here";

      expect(() => {
        jwt.verify(invalidToken, secret);
      }).toThrow();
    });
  });

  describe("Token Expiration", () => {
    it("should create a token that can expire", () => {
      const secret = "test-secret-key-minimum-32-characters-long";
      const payload = { userId: "user-123" };

      // Create an expired token
      const expiredToken = jwt.sign(payload, secret, { expiresIn: "0s" });

      // Wait a moment for expiration
      setTimeout(() => {
        expect(() => {
          jwt.verify(expiredToken, secret);
        }).toThrow();
      }, 100);
    });
  });
});
