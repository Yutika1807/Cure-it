import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertEmergencyContactSchema, insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (!sessionId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const session = await storage.getSession(sessionId);
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const user = await storage.getUser(session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    req.sessionId = sessionId;
    next();
  };

  const requireAdmin = async (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      
      let user = await storage.getUserByEmail(email);
      if (!user) {
        // Create new user
        const role = email === 'yutikamadwai1828@gmail.com' ? 'admin' : 'user';
        user = await storage.createUser({ email, role });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLoginAt: new Date() });

      // Create session
      const sessionId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await storage.createSession({ id: sessionId, userId: user.id, expiresAt });

      res.json({ user, sessionId });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req: any, res) => {
    await storage.deleteSession(req.sessionId);
    res.json({ success: true });
  });

  app.get("/api/auth/me", requireAuth, async (req: any, res) => {
    res.json({ user: req.user });
  });

  // Emergency contacts routes
  app.get("/api/emergency-contacts", async (req, res) => {
    try {
      const filters = {
        city: req.query.city as string,
        state: req.query.state as string,
        serviceType: req.query.serviceType as string,
        search: req.query.search as string,
      };

      const contacts = await storage.getEmergencyContacts(filters);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.get("/api/emergency-contacts/:id", async (req, res) => {
    try {
      const contact = await storage.getEmergencyContact(req.params.id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contact" });
    }
  });

  app.post("/api/emergency-contacts", requireAuth, requireAdmin, async (req, res) => {
    try {
      const contactData = insertEmergencyContactSchema.parse(req.body);
      const contact = await storage.createEmergencyContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      res.status(400).json({ error: "Invalid contact data" });
    }
  });

  app.put("/api/emergency-contacts/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const updates = insertEmergencyContactSchema.partial().parse(req.body);
      const contact = await storage.updateEmergencyContact(req.params.id, updates);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/emergency-contacts/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteEmergencyContact(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/analytics", requireAuth, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const contacts = await storage.getEmergencyContacts();
      
      const analytics = {
        totalUsers: users.length,
        activeToday: users.filter(u => {
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return u.lastLoginAt && u.lastLoginAt > dayAgo;
        }).length,
        adminUsers: users.filter(u => u.role === 'admin').length,
        totalContacts: contacts.length,
        serviceDistribution: contacts.reduce((acc: any, contact) => {
          acc[contact.serviceType] = (acc[contact.serviceType] || 0) + 1;
          return acc;
        }, {}),
        locationDistribution: contacts.reduce((acc: any, contact) => {
          const location = `${contact.city}, ${contact.state}`;
          acc[location] = (acc[location] || 0) + 1;
          return acc;
        }, {}),
      };

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Location detection route
  app.post("/api/location/detect", async (req, res) => {
    try {
      const { latitude, longitude } = z.object({
        latitude: z.number(),
        longitude: z.number(),
      }).parse(req.body);

      // Use BigDataCloud API for reverse geocoding
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      
      res.json({
        city: data.city || data.locality || 'Mumbai',
        state: data.principalSubdivision || 'Maharashtra',
        country: data.countryName || 'India',
      });
    } catch (error) {
      // Fallback to default location
      res.json({
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      });
    }
  });

  // Clean up expired sessions periodically
  setInterval(async () => {
    await storage.deleteExpiredSessions();
  }, 60 * 60 * 1000); // Every hour

  const httpServer = createServer(app);
  return httpServer;
}
