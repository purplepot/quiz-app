import * as crypto from "crypto";

/**
 * Simple password hashing (in production, use bcrypt)
 */
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Simple JWT-like token generation
 * Format: userId.timestamp.signature
 */
export function generateToken(userId: string): string {
  const timestamp = Date.now();
  const payload = `${userId}.${timestamp}`;
  const signature = crypto
    .createHash("sha256")
    .update(payload + (process.env.JWT_SECRET || "quiz-app-secret"))
    .digest("hex")
    .slice(0, 16);
  return `${payload}.${signature}`;
}

export function verifyToken(token: string): {
  userId: string;
  isValid: boolean;
} {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { userId: "", isValid: false };

    const [userId, timestamp, providedSignature] = parts;
    const payload = `${userId}.${timestamp}`;
    const expectedSignature = crypto
      .createHash("sha256")
      .update(payload + (process.env.JWT_SECRET || "quiz-app-secret"))
      .digest("hex")
      .slice(0, 16);

    const isValid = providedSignature === expectedSignature;

    // Optional: Check token expiration (24 hours)
    const tokenAge = Date.now() - parseInt(timestamp, 10);
    const isExpired = tokenAge > 24 * 60 * 60 * 1000;

    return { userId, isValid: isValid && !isExpired };
  } catch {
    return { userId: "", isValid: false };
  }
}
