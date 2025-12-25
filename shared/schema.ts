import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // Acts as email
  password: text("password").notNull(),
  businessName: text("business_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feedbacks = pgTable("feedbacks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // The business this feedback is for
  
  // P1: NPS (0-10)
  npsScore: integer("nps_score").notNull(), 
  
  // P2: Comida (1-5)
  ratingFood: integer("rating_food").notNull().default(0),
  
  // P3: Atendimento (1-5)
  ratingService: integer("rating_service").notNull().default(0),
  
  // P4: Tempo de espera (1-5)
  ratingWaitTime: integer("rating_wait_time").notNull().default(0),
  
  // P5: Limpeza/Ambiente (1-5)
  ratingAmbiance: integer("rating_ambiance").notNull().default(0),
  
  // P6: Comentário
  comment: text("comment"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true 
});

export const insertFeedbackSchema = createInsertSchema(feedbacks).omit({ 
  id: true, 
  createdAt: true 
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
