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

// Use mock storage for development (since we don't have a real database)
const useMockStorage = true;

if (!useMockStorage) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
}

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

// Mock storage for development
export class MockStorage implements IStorage {
  private users: User[] = [
    // Default admin user
    {
      id: 'admin-1',
      email: 'yutikamadwai1828@gmail.com',
      password: '$2b$10$xRdxWoF.iLcjTEDtzAbBUOSSRfyDa9aaDN4ZW9bPF6QlQpY7u.LbG', // 'yutika1234$'
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
    }
  ];
  private emergencyContacts: EmergencyContact[] = [
    // Mumbai Emergency Contacts
    {
      id: 'contact-1',
      name: 'Mumbai Police Control Room',
      designation: 'Emergency Response',
      facility: 'Mumbai Police Department',
      serviceType: 'police',
      phone: '100',
      alternatePhone: '022-22621855',
      email: 'control@mumbaipolice.gov.in',
      address: 'Police Headquarters, Crawford Market, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      availability: '24/7',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'contact-2',
      name: 'Bombay Hospital',
      designation: 'Emergency Department',
      facility: 'Bombay Hospital & Medical Research Centre',
      serviceType: 'medical',
      phone: '022-22067676',
      alternatePhone: '022-22067677',
      email: 'emergency@bombayhospital.com',
      address: '12, New Marine Lines, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      availability: '24/7',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'contact-3',
      name: 'Mumbai Fire Brigade',
      designation: 'Fire Emergency',
      facility: 'Mumbai Fire Brigade',
      serviceType: 'fire',
      phone: '101',
      alternatePhone: '022-23076111',
      email: 'fire@mumbai.gov.in',
      address: 'Fire Brigade Headquarters, Byculla, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      availability: '24/7',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'contact-4',
      name: 'BMC Emergency',
      designation: 'Municipal Services',
      facility: 'Brihanmumbai Municipal Corporation',
      serviceType: 'municipal',
      phone: '022-24937744',
      alternatePhone: '022-24937745',
      email: 'emergency@bmc.gov.in',
      address: 'BMC Headquarters, CST, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      availability: '24/7',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Delhi Emergency Contacts
    {
      id: 'contact-5',
      name: 'Delhi Police Control Room',
      designation: 'Emergency Response',
      facility: 'Delhi Police Department',
      serviceType: 'police',
      phone: '100',
      alternatePhone: '011-23469000',
      email: 'control@delhipolice.gov.in',
      address: 'Police Headquarters, ITO, Delhi',
      city: 'Delhi',
      state: 'Delhi',
      availability: '24/7',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'contact-6',
      name: 'AIIMS Delhi',
      designation: 'Emergency Department',
      facility: 'All India Institute of Medical Sciences',
      serviceType: 'medical',
      phone: '011-26588500',
      alternatePhone: '011-26589900',
      email: 'emergency@aiims.edu',
      address: 'Ansari Nagar, Delhi',
      city: 'Delhi',
      state: 'Delhi',
      availability: '24/7',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'contact-7',
      name: 'Delhi Fire Service',
      designation: 'Fire Emergency',
      facility: 'Delhi Fire Service',
      serviceType: 'fire',
      phone: '101',
      alternatePhone: '011-23469001',
      email: 'fire@delhi.gov.in',
      address: 'Fire Service Headquarters, Delhi',
      city: 'Delhi',
      state: 'Delhi',
      availability: '24/7',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Bangalore Emergency Contacts
    {
      id: 'contact-8',
      name: 'Bangalore Police Control',
      designation: 'Emergency Response',
      facility: 'Bangalore City Police',
      serviceType: 'police',
      phone: '100',
      alternatePhone: '080-22942222',
      email: 'control@bangalorepolice.gov.in',
      address: 'Police Commissioner Office, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka',
      availability: '24/7',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'contact-9',
      name: 'Victoria Hospital',
      designation: 'Emergency Department',
      facility: 'Victoria Hospital',
      serviceType: 'medical',
      phone: '080-26701150',
      alternatePhone: '080-26701151',
      email: 'emergency@victoriahospital.gov.in',
      address: 'Fort Road, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka',
      availability: '24/7',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Chennai Emergency Contacts
    {
      id: 'contact-10',
      name: 'Chennai Police Control',
      designation: 'Emergency Response',
      facility: 'Chennai City Police',
      serviceType: 'police',
      phone: '100',
      alternatePhone: '044-23452345',
      email: 'control@chennaipolice.gov.in',
      address: 'Police Commissioner Office, Chennai',
      city: 'Chennai',
      state: 'Tamil Nadu',
      availability: '24/7',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'contact-11',
      name: 'Government General Hospital',
      designation: 'Emergency Department',
      facility: 'Government General Hospital',
      serviceType: 'medical',
      phone: '044-25305000',
      alternatePhone: '044-25305001',
      email: 'emergency@gghchennai.gov.in',
      address: 'Park Town, Chennai',
      city: 'Chennai',
      state: 'Tamil Nadu',
      availability: '24/7',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];
  private sessions: Session[] = [];

  // User management
  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    console.log('Looking for user with email:', email);
    console.log('Available users:', this.users.map(u => ({ id: u.id, email: u.email, role: u.role })));
    const user = this.users.find(u => u.email === email);
    console.log('Found user:', user ? { id: user.id, email: user.email, role: user.role } : 'Not found');
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user,
      id: user.id || crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    this.users[index] = { ...this.users[index], ...updates, updatedAt: new Date() };
    return this.users[index];
  }

  async getAllUsers(): Promise<User[]> {
    return [...this.users].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Emergency contacts
  async getEmergencyContacts(filters?: {
    city?: string;
    state?: string;
    serviceType?: string;
    search?: string;
  }): Promise<EmergencyContact[]> {
    let contacts = this.emergencyContacts.filter(c => c.isActive);

    if (filters?.city) {
      contacts = contacts.filter(c => c.city === filters.city);
    }
    if (filters?.state) {
      contacts = contacts.filter(c => c.state === filters.state);
    }
    if (filters?.serviceType) {
      contacts = contacts.filter(c => c.serviceType === filters.serviceType);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      contacts = contacts.filter(c => 
        c.name.toLowerCase().includes(search) ||
        c.designation.toLowerCase().includes(search) ||
        c.facility.toLowerCase().includes(search)
      );
    }

    return contacts.sort((a, b) => {
      if (a.serviceType !== b.serviceType) {
        return a.serviceType.localeCompare(b.serviceType);
      }
      return a.name.localeCompare(b.name);
    });
  }

  async getEmergencyContact(id: string): Promise<EmergencyContact | undefined> {
    return this.emergencyContacts.find(c => c.id === id);
  }

  async createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact> {
    const newContact: EmergencyContact = {
      ...contact,
      id: contact.id || crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.emergencyContacts.push(newContact);
    return newContact;
  }

  async updateEmergencyContact(id: string, updates: Partial<InsertEmergencyContact>): Promise<EmergencyContact | undefined> {
    const index = this.emergencyContacts.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    this.emergencyContacts[index] = { 
      ...this.emergencyContacts[index], 
      ...updates, 
      updatedAt: new Date() 
    };
    return this.emergencyContacts[index];
  }

  async deleteEmergencyContact(id: string): Promise<boolean> {
    const index = this.emergencyContacts.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.emergencyContacts.splice(index, 1);
    return true;
  }

  // Sessions
  async createSession(session: InsertSession): Promise<Session> {
    const newSession: Session = {
      ...session,
      id: session.id || crypto.randomUUID(),
      createdAt: new Date()
    };
    this.sessions.push(newSession);
    return newSession;
  }

  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.find(s => s.id === id);
  }

  async deleteSession(id: string): Promise<boolean> {
    const index = this.sessions.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.sessions.splice(index, 1);
    return true;
  }

  async deleteExpiredSessions(): Promise<void> {
    const now = new Date();
    this.sessions = this.sessions.filter(s => s.expiresAt > now);
  }
}

export const storage = useMockStorage ? new MockStorage() : new DatabaseStorage();
