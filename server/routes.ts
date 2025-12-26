import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const { hashPassword } = setupAuth(app);

  // Auth Routes
  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      console.log("[REGISTER] Attempting registration for:", req.body.username);
      
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log("[REGISTER] User already exists:", req.body.username);
        return res.status(400).json({ message: "Username already exists" });
      }

      const input = api.auth.register.input.parse(req.body);
      const hashedPassword = await hashPassword(input.password);
      
      console.log("[REGISTER] Creating user in database...");
      const user = await storage.createUser({
        ...input,
        password: hashedPassword,
      });
      console.log("[REGISTER] User created successfully:", user.id, user.username);

      req.login(user, (err) => {
        if (err) {
          console.log("[REGISTER] Login after registration failed:", err);
          return next(err);
        }
        console.log("[REGISTER] User logged in after registration");
        res.status(201).json(user);
      });
    } catch (err) {
      console.log("[REGISTER] Error during registration:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      next(err);
    }
  });

  app.post(api.auth.login.path, (req, res, next) => {
    const passportLogin = passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json(user);
      });
    });
    // @ts-ignore
    passportLogin(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get(api.auth.user.path, (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Protected Routes Middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Stats
  app.get(api.feedbacks.stats.path, requireAuth, async (req, res) => {
    const days = req.query.days ? parseInt(req.query.days as string) : undefined;
    const stats = await storage.getStats((req.user as any).id, days);
    res.json(stats);
  });

  // List Feedbacks
  app.get(api.feedbacks.list.path, requireAuth, async (req, res) => {
    const days = req.query.days ? parseInt(req.query.days as string) : undefined;
    const feedbacks = await storage.getFeedbacks((req.user as any).id, days);
    res.json(feedbacks);
  });

  // Delete All Feedbacks
  app.delete(api.feedbacks.deleteAll.path, requireAuth, async (req, res) => {
    await storage.deleteUserFeedbacks((req.user as any).id);
    res.json({ message: "All feedbacks deleted" });
  });

  // Public Routes (No Auth)
  
  // Submit Feedback
  app.post(api.feedbacks.submit.path, async (req, res) => {
    try {
      const input = api.feedbacks.submit.input.parse(req.body);
      
      // Verify business exists
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

  // Get Business Info (for public form)
  app.get(api.public.business.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const business = await storage.getUser(id);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    res.json({ businessName: business.businessName });
  });

  return httpServer;
}

import passport from "passport";
