import express, { type Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { z } from "zod";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, desc, gte, and } from "drizzle-orm";
import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

const app = express();

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

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

const pool = new Pool({
  connectionString: process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool);

// Schema definitions
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  businessName: text("business_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const feedbacks = pgTable("feedbacks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  npsScore: integer("nps_score").notNull(),
  ratingFood: integer("rating_food").notNull(),
  ratingService: integer("rating_service").notNull(),
  ratingWaitTime: integer("rating_wait_time").notNull(),
  ratingAmbiance: integer("rating_ambiance").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
const insertFeedbackSchema = createInsertSchema(feedbacks).omit({ id: true, createdAt: true });

type User = typeof users.$inferSelect;
type InsertUser = z.infer<typeof insertUserSchema>;
type Feedback = typeof feedbacks.$inferSelect;
type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

// Storage layer
const storage = {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  },

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  },

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  },

  async createFeedback(feedback: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db.insert(feedbacks).values(feedback).returning();
    return newFeedback;
  },

  async getFeedbacks(userId: number, days?: number): Promise<Feedback[]> {
    let query = db.select()
      .from(feedbacks)
      .where(
        days 
          ? and(eq(feedbacks.userId, userId), gte(feedbacks.createdAt, new Date(Date.now() - days * 24 * 60 * 60 * 1000)))
          : eq(feedbacks.userId, userId)
      )
      .orderBy(desc(feedbacks.createdAt));
    
    return await query;
  },

  async getStats(userId: number, days?: number) {
    const dateLimit = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;
    
    const result = await db.select()
      .from(feedbacks)
      .where(
        dateLimit 
          ? and(eq(feedbacks.userId, userId), gte(feedbacks.createdAt, dateLimit))
          : eq(feedbacks.userId, userId)
      );
      
    const total = result.length;
    
    if (total === 0) {
      return { 
        totalFeedbacks: 0, 
        npsScore: 0,
        avgFood: 0,
        avgService: 0,
        avgWaitTime: 0,
        avgAmbiance: 0,
        promoters: 0,
        passives: 0,
        detractors: 0
      };
    }

    const promoters = result.filter(f => f.npsScore >= 9).length;
    const passives = result.filter(f => f.npsScore >= 7 && f.npsScore <= 8).length;
    const detractors = result.filter(f => f.npsScore <= 6).length;
    const nps = ((promoters - detractors) / total) * 100;

    const avgFood = result.reduce((acc, curr) => acc + curr.ratingFood, 0) / total;
    const avgService = result.reduce((acc, curr) => acc + curr.ratingService, 0) / total;
    const avgWaitTime = result.reduce((acc, curr) => acc + curr.ratingWaitTime, 0) / total;
    const avgAmbiance = result.reduce((acc, curr) => acc + curr.ratingAmbiance, 0) / total;

    return {
      totalFeedbacks: total,
      npsScore: Math.round(nps),
      avgFood: parseFloat(avgFood.toFixed(1)),
      avgService: parseFloat(avgService.toFixed(1)),
      avgWaitTime: parseFloat(avgWaitTime.toFixed(1)),
      avgAmbiance: parseFloat(avgAmbiance.toFixed(1)),
      promoters,
      passives,
      detractors
    };
  },

  async deleteUserFeedbacks(userId: number): Promise<void> {
    await db.delete(feedbacks).where(eq(feedbacks.userId, userId));
  },

  async createPasswordResetToken(data: { userId: number; token: string; expiresAt: Date; used: boolean }) {
    const [token] = await db.insert(passwordResetTokens).values(data).returning();
    return token;
  },

  async getPasswordResetToken(token: string) {
    const [resetToken] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return resetToken;
  },

  async markTokenAsUsed(id: number) {
    await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, id));
  },

  async updateUserPassword(userId: number, hashedPassword: string) {
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
  }
};

// Password utilities
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

// JWT utilities
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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// JWT Auth middleware - checks both cookie and Authorization header
const requireAuth = (req: any, res: any, next: any) => {
  // Try Authorization header first
  const authHeader = req.headers.authorization;
  let token: string | undefined;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Try cookie
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
  
  req.user = decoded;
  next();
};

// Auth routes
app.post("/api/register", async (req, res, next) => {
  try {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const input = insertUserSchema.parse(req.body);
    const hashedPassword = await hashPassword(input.password);
    const user = await storage.createUser({
      ...input,
      password: hashedPassword,
    });

    const token = generateToken(user);
    
    // Set cookie for browser
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
    
    res.status(201).json({ 
      id: user.id,
      username: user.username,
      businessName: user.businessName,
      token 
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: err.errors[0].message,
        field: err.errors[0].path.join('.'),
      });
    }
    next(err);
  }
});

app.post("/api/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }
    
    const user = await storage.getUserByUsername(username);
    if (!user || !(await comparePasswords(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const token = generateToken(user);
    
    // Set cookie for browser
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
    
    res.status(200).json({ 
      id: user.id,
      username: user.username,
      businessName: user.businessName,
      token 
    });
  } catch (err) {
    next(err);
  }
});

app.post("/api/logout", (req, res) => {
  res.setHeader('Set-Cookie', 'token=; Path=/; HttpOnly; Max-Age=0');
  res.sendStatus(200);
});

app.get("/api/user", requireAuth, async (req, res) => {
  const user = await storage.getUser((req as any).user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({
    id: user.id,
    username: user.username,
    businessName: user.businessName
  });
});

// Password reset routes
app.post("/api/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "E-mail é obrigatório" });
    }

    const user = await storage.getUserByUsername(email);
    if (!user) {
      return res.status(404).json({ message: "E-mail não encontrado" });
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await storage.createPasswordResetToken({
      userId: user.id,
      token,
      expiresAt,
      used: false,
    });

    const protocol = req.get("x-forwarded-proto") || req.protocol || "https";
    const baseUrl = process.env.BASE_URL || `${protocol}://${req.get("host")}`;
    const resetLink = `${baseUrl}/reset-password/${token}`;

    res.json({
      message: "Link de redefinição gerado com sucesso",
      resetLink,
    });
  } catch (err) {
    next(err);
  }
});

app.post("/api/reset-password", async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token e nova senha são obrigatórios" });
    }

    const resetToken = await storage.getPasswordResetToken(token);
    if (!resetToken) {
      return res.status(404).json({ message: "Token inválido ou expirado" });
    }

    if (resetToken.used) {
      return res.status(400).json({ message: "Este link já foi utilizado" });
    }

    if (new Date() > resetToken.expiresAt) {
      return res.status(400).json({ message: "Token expirado. Solicite um novo link." });
    }

    const hashedPassword = await hashPassword(newPassword);
    await storage.updateUserPassword(resetToken.userId, hashedPassword);
    await storage.markTokenAsUsed(resetToken.id);

    res.json({ message: "Senha redefinida com sucesso" });
  } catch (err) {
    next(err);
  }
});

// Protected routes
app.get("/api/stats", requireAuth, async (req, res) => {
  const days = req.query.days ? parseInt(req.query.days as string) : undefined;
  const stats = await storage.getStats((req as any).user.id, days);
  res.json(stats);
});

app.get("/api/feedbacks", requireAuth, async (req, res) => {
  const days = req.query.days ? parseInt(req.query.days as string) : undefined;
  const feedbacksList = await storage.getFeedbacks((req as any).user.id, days);
  res.json(feedbacksList);
});

app.delete("/api/feedbacks", requireAuth, async (req, res) => {
  await storage.deleteUserFeedbacks((req as any).user.id);
  res.json({ message: "All feedbacks deleted" });
});

// Public routes
app.post("/api/feedbacks", async (req, res) => {
  try {
    const input = insertFeedbackSchema.parse(req.body);
    
    const business = await storage.getUser(input.userId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const feedback = await storage.createFeedback(input);
    res.status(201).json(feedback);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: err.errors[0].message,
        field: err.errors[0].path.join('.'),
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/business/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

  const business = await storage.getUser(id);
  if (!business) {
    return res.status(404).json({ message: "Business not found" });
  }

  res.json({ businessName: business.businessName });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server error:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

module.exports = app;
