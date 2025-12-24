import { users, feedbacks, type User, type InsertUser, type Feedback, type InsertFeedback } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbacks(userId: number): Promise<Feedback[]>;
  getStats(userId: number): Promise<{ totalFeedbacks: number, averageRating: number, npsScore: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createFeedback(feedback: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db.insert(feedbacks).values(feedback).returning();
    return newFeedback;
  }

  async getFeedbacks(userId: number): Promise<Feedback[]> {
    return await db.select()
      .from(feedbacks)
      .where(eq(feedbacks.userId, userId))
      .orderBy(desc(feedbacks.createdAt));
  }

  async getStats(userId: number): Promise<{ totalFeedbacks: number, averageRating: number, npsScore: number }> {
    const result = await db.select().from(feedbacks).where(eq(feedbacks.userId, userId));
    const total = result.length;
    if (total === 0) return { totalFeedbacks: 0, averageRating: 0, npsScore: 0 };

    const avgRating = result.reduce((acc, curr) => acc + curr.rating, 0) / total;

    // NPS Calculation: (Promoters % - Detractors %) * 100
    // Promoters: 9-10, Passives: 7-8, Detractors: 0-6
    const promoters = result.filter(f => f.npsScore >= 9).length;
    const detractors = result.filter(f => f.npsScore <= 6).length;
    const nps = ((promoters - detractors) / total) * 100;

    return {
      totalFeedbacks: total,
      averageRating: parseFloat(avgRating.toFixed(1)),
      npsScore: Math.round(nps)
    };
  }
}

export const storage = new DatabaseStorage();
