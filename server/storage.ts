import { 
  users, 
  watchedAddresses, 
  transactionHistory,
  type User, 
  type InsertUser,
  type WatchedAddress,
  type InsertWatchedAddress,
  type TransactionHistoryItem,
  type InsertTransactionHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Watched addresses
  getWatchedAddresses(userId: number): Promise<WatchedAddress[]>;
  addWatchedAddress(watchedAddress: InsertWatchedAddress): Promise<WatchedAddress>;
  removeWatchedAddress(id: number): Promise<void>;
  
  // Transaction history
  getTransactionHistory(userId?: number): Promise<TransactionHistoryItem[]>;
  addTransaction(transaction: InsertTransactionHistory): Promise<TransactionHistoryItem>;
}

export class DatabaseStorage implements IStorage {
  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Watched addresses
  async getWatchedAddresses(userId: number): Promise<WatchedAddress[]> {
    return await db.select().from(watchedAddresses).where(eq(watchedAddresses.userId, userId));
  }

  async addWatchedAddress(watchedAddress: InsertWatchedAddress): Promise<WatchedAddress> {
    const [address] = await db.insert(watchedAddresses).values(watchedAddress).returning();
    return address;
  }

  async removeWatchedAddress(id: number): Promise<void> {
    await db.delete(watchedAddresses).where(eq(watchedAddresses.id, id));
  }

  // Transaction history
  async getTransactionHistory(userId?: number): Promise<TransactionHistoryItem[]> {
    const query = db.select().from(transactionHistory).orderBy(desc(transactionHistory.timestamp));
    
    if (userId) {
      return await query.where(eq(transactionHistory.userId, userId));
    }
    
    return await query;
  }

  async addTransaction(transaction: InsertTransactionHistory): Promise<TransactionHistoryItem> {
    const [tx] = await db.insert(transactionHistory).values(transaction).returning();
    return tx;
  }
}

export const storage = new DatabaseStorage();
