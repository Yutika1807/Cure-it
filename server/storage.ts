import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { eq, and, ilike, or, desc, sql } from "drizzle-orm";
import ws from "ws";
import { 
  type User, 
  type InsertUser,
  type EmergencyContact,
  type InsertEmergencyContact,
  type Session,
  type InsertSession,
  users,
  emergencyContacts,
  sessions
} from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Emergency contacts
  getEmergencyContacts(filters?: {
    city?: string;
    state?: string;
    serviceType?: string;
    search?: string;
  }): Promise<EmergencyContact[]>;
  getEmergencyContact(id: string): Promise<EmergencyContact | undefined>;
  createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact>;
  updateEmergencyContact(id: string, updates: Partial<InsertEmergencyContact>): Promise<EmergencyContact | undefined>;
  deleteEmergencyContact(id: string): Promise<boolean>;
  
  // Sessions
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  deleteSession(id: string): Promise<boolean>;
  deleteExpiredSessions(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User management
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Emergency contacts
  async getEmergencyContacts(filters?: {
    city?: string;
    state?: string;
    serviceType?: string;
    search?: string;
  }): Promise<EmergencyContact[]> {
    const whereConditions = [eq(emergencyContacts.isActive, true)];

    if (filters?.city) {
      whereConditions.push(eq(emergencyContacts.city, filters.city));
    }

    if (filters?.state) {
      whereConditions.push(eq(emergencyContacts.state, filters.state));
    }

    if (filters?.serviceType) {
      whereConditions.push(eq(emergencyContacts.serviceType, filters.serviceType));
    }

    if (filters?.search) {
      whereConditions.push(
        or(
          ilike(emergencyContacts.name, `%${filters.search}%`),
          ilike(emergencyContacts.designation, `%${filters.search}%`),
          ilike(emergencyContacts.facility, `%${filters.search}%`)
        )
      );
    }

    return await db.select().from(emergencyContacts)
      .where(and(...whereConditions))
      .orderBy(emergencyContacts.serviceType, emergencyContacts.name);
  }

  async getEmergencyContact(id: string): Promise<EmergencyContact | undefined> {
    const result = await db.select().from(emergencyContacts).where(eq(emergencyContacts.id, id)).limit(1);
    return result[0];
  }

  async createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact> {
    const result = await db.insert(emergencyContacts).values(contact).returning();
    return result[0];
  }

  async updateEmergencyContact(id: string, updates: Partial<InsertEmergencyContact>): Promise<EmergencyContact | undefined> {
    const result = await db.update(emergencyContacts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(emergencyContacts.id, id))
      .returning();
    return result[0];
  }

  async deleteEmergencyContact(id: string): Promise<boolean> {
    const result = await db.delete(emergencyContacts).where(eq(emergencyContacts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Sessions
  async createSession(session: InsertSession): Promise<Session> {
    const result = await db.insert(sessions).values(session).returning();
    return result[0];
  }

  async getSession(id: string): Promise<Session | undefined> {
    const result = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
    return result[0];
  }

  async deleteSession(id: string): Promise<boolean> {
    const result = await db.delete(sessions).where(eq(sessions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(sql`expires_at < NOW()`);
  }
}

export const storage = new DatabaseStorage();
