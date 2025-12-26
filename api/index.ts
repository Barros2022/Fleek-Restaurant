import express, { type Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
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
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

const app = express();

const scryptAsync = promisify(scrypt);

const pool = new Pool({
  connectionString: process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  businessName: text("business_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feedbacks = pgTable("feedbacks", {
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

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertFeedbackSchema = createInsertSchema(feedbacks).omit({ id: true, createdAt: true });

type User = typeof users.$inferSelect;
type InsertUser = z.infer<typeof insertUserSchema>;
type Feedback = typeof feedbacks.$inferSelect;
type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

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
  }
};

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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PgSession = connectPgSimple(session);

app.use(session({
  store: new PgSession({
    pool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    } catch (err) {
      return done(err);
    }
  }),
);

passport.serializeUser((user, done) => done(null, (user as User).id));
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

const requireAuth = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

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

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
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

app.post("/api/login", (req, res, next) => {
  const passportLogin = passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    req.login(user, (err) => {
      if (err) return next(err);
      res.status(200).json(user);
    });
  });
  passportLogin(req, res, next);
});

app.post("/api/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

app.get("/api/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

app.get("/api/stats", requireAuth, async (req, res) => {
  const days = req.query.days ? parseInt(req.query.days as string) : undefined;
  const stats = await storage.getStats((req.user as any).id, days);
  res.json(stats);
});

app.get("/api/feedbacks", requireAuth, async (req, res) => {
  const days = req.query.days ? parseInt(req.query.days as string) : undefined;
  const feedbacks = await storage.getFeedbacks((req.user as any).id, days);
  res.json(feedbacks);
});

app.delete("/api/feedbacks", requireAuth, async (req, res) => {
  await storage.deleteUserFeedbacks((req.user as any).id);
  res.json({ message: "All feedbacks deleted" });
});

app.post("/api/feedback", async (req, res) => {
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

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

export default app;
