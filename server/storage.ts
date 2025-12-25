import { users, feedbacks, type User, type InsertUser, type Feedback, type InsertFeedback } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbacks(userId: number): Promise<Feedback[]>;
  getStats(userId: number): Promise<{ 
    totalFeedbacks: number, 
    npsScore: number,
    avgFood: number,
    avgService: number,
    avgWaitTime: number,
    avgAmbiance: number
  }>;
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

  async getStats(userId: number): Promise<{ 
    totalFeedbacks: number, 
    npsScore: number,
    avgFood: number,
    avgService: number,
    avgWaitTime: number,
    avgAmbiance: number
  }> {
    const result = await db.select().from(feedbacks).where(eq(feedbacks.userId, userId));
    const total = result.length;
    
    if (total === 0) {
      return { 
        totalFeedbacks: 0, 
        npsScore: 0,
        avgFood: 0,
        avgService: 0,
        avgWaitTime: 0,
        avgAmbiance: 0
      };
    }

    // NPS Calculation
    const promoters = result.filter(f => f.npsScore >= 9).length;
    const detractors = result.filter(f => f.npsScore <= 6).length;
    const nps = ((promoters - detractors) / total) * 100;

    // Averages
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
      avgAmbiance: parseFloat(avgAmbiance.toFixed(1))
    };
  }
}

export const storage = new DatabaseStorage();
