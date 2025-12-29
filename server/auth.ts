import { Express, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";

const scryptAsync = promisify(scrypt);

// In production, require a real secret. In development, allow a fallback.
function getJwtSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET or SESSION_SECRET environment variable is required in production');
  }
  return secret || 'fleek-dev-secret-local-only';
}

const JWT_SECRET = getJwtSecret();

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, username: user.username, businessName: user.businessName },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function verifyToken(token: string): { id: number; username: string; businessName: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; username: string; businessName: string };
  } catch {
    return null;
  }
}

// Middleware to check JWT from Authorization header or cookie
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    const cookies = req.headers.cookie;
    if (cookies) {
      const tokenCookie = cookies.split(';').find((c: string) => c.trim().startsWith('token='));
      if (tokenCookie) {
        token = tokenCookie.split('=')[1];
      }
    }
  }
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
  
  (req as any).user = decoded;
  next();
}

export function setupAuth(app: Express) {
  // No session/passport setup needed - we use stateless JWT
  return { hashPassword, comparePasswords, generateToken, verifyToken };
}
