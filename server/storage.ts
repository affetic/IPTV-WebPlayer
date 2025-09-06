import { type User, type InsertUser, type XtreamSession, type InsertXtreamSession, type Channel, type InsertChannel } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createXtreamSession(session: InsertXtreamSession): Promise<XtreamSession>;
  getXtreamSession(sessionId: string): Promise<XtreamSession | undefined>;
  updateXtreamSession(sessionId: string, updates: Partial<XtreamSession>): Promise<XtreamSession | undefined>;
  deleteXtreamSession(sessionId: string): Promise<void>;
  
  createChannels(channels: InsertChannel[]): Promise<Channel[]>;
  getChannelsBySession(sessionId: string): Promise<Channel[]>;
  deleteChannelsBySession(sessionId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private xtreamSessions: Map<string, XtreamSession>;
  private channels: Map<string, Channel>;

  constructor() {
    this.users = new Map();
    this.xtreamSessions = new Map();
    this.channels = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createXtreamSession(insertSession: InsertXtreamSession): Promise<XtreamSession> {
    const id = randomUUID();
    const session: XtreamSession = {
      ...insertSession,
      id,
      createdAt: new Date(),
      isActive: true,
    };
    this.xtreamSessions.set(id, session);
    return session;
  }

  async getXtreamSession(sessionId: string): Promise<XtreamSession | undefined> {
    return this.xtreamSessions.get(sessionId);
  }

  async updateXtreamSession(sessionId: string, updates: Partial<XtreamSession>): Promise<XtreamSession | undefined> {
    const session = this.xtreamSessions.get(sessionId);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.xtreamSessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  async deleteXtreamSession(sessionId: string): Promise<void> {
    this.xtreamSessions.delete(sessionId);
  }

  async createChannels(insertChannels: InsertChannel[]): Promise<Channel[]> {
    const channels = insertChannels.map(channel => ({
      ...channel,
      id: randomUUID(),
    }));
    
    channels.forEach(channel => {
      this.channels.set(channel.id, channel);
    });
    
    return channels;
  }

  async getChannelsBySession(sessionId: string): Promise<Channel[]> {
    return Array.from(this.channels.values()).filter(
      channel => channel.sessionId === sessionId
    );
  }

  async deleteChannelsBySession(sessionId: string): Promise<void> {
    const channelsToDelete = Array.from(this.channels.entries())
      .filter(([_, channel]) => channel.sessionId === sessionId)
      .map(([id]) => id);
    
    channelsToDelete.forEach(id => {
      this.channels.delete(id);
    });
  }
}

export const storage = new MemStorage();
