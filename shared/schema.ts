import { z } from "zod";
import { pgTable, serial, varchar, timestamp, text, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// Ethereum block data
export const blockSchema = z.object({
  number: z.number(),
  hash: z.string(),
  timestamp: z.number(),
  gasUsed: z.string(),
  gasLimit: z.string(),
  transactionCount: z.number(),
  age: z.string(),
});

// Ethereum transaction data
export const transactionSchema = z.object({
  hash: z.string(),
  from: z.string(),
  to: z.string().nullable(),
  value: z.string(),
  gasUsed: z.string().optional(),
  gasPrice: z.string().optional(),
  timestamp: z.number(),
  status: z.enum(['success', 'failed', 'pending']),
  type: z.enum(['send', 'receive', 'contract']),
});

// Network information
export const networkInfoSchema = z.object({
  chainId: z.number(),
  name: z.string(),
  blockNumber: z.number(),
  isConnected: z.boolean(),
  responseTime: z.number().optional(),
});

// Wallet balance
export const balanceSchema = z.object({
  address: z.string(),
  balance: z.string(),
  balanceInEth: z.string(),
});

// API response schemas
export const balanceResponseSchema = z.object({
  address: z.string(),
  balance: z.string(),
  balanceInEth: z.string(),
});

export const blocksResponseSchema = z.array(blockSchema);
export const transactionsResponseSchema = z.array(transactionSchema);
export const networkStatusResponseSchema = networkInfoSchema;

// Database tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const watchedAddresses = pgTable("watched_addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  address: varchar("address", { length: 42 }).notNull(),
  nickname: varchar("nickname", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactionHistory = pgTable("transaction_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  txHash: varchar("tx_hash", { length: 66 }).notNull(),
  fromAddress: varchar("from_address", { length: 42 }).notNull(),
  toAddress: varchar("to_address", { length: 42 }),
  value: varchar("value", { length: 100 }).notNull(),
  blockNumber: integer("block_number").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  gasUsed: varchar("gas_used", { length: 50 }),
  gasPrice: varchar("gas_price", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  watchedAddresses: many(watchedAddresses),
  transactionHistory: many(transactionHistory),
}));

export const watchedAddressesRelations = relations(watchedAddresses, ({ one }) => ({
  user: one(users, { fields: [watchedAddresses.userId], references: [users.id] }),
}));

export const transactionHistoryRelations = relations(transactionHistory, ({ one }) => ({
  user: one(users, { fields: [transactionHistory.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertWatchedAddressSchema = createInsertSchema(watchedAddresses).omit({ id: true, createdAt: true });
export const insertTransactionHistorySchema = createInsertSchema(transactionHistory).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type WatchedAddress = typeof watchedAddresses.$inferSelect;
export type InsertWatchedAddress = z.infer<typeof insertWatchedAddressSchema>;
export type TransactionHistoryItem = typeof transactionHistory.$inferSelect;
export type InsertTransactionHistory = z.infer<typeof insertTransactionHistorySchema>;

export type Block = z.infer<typeof blockSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type NetworkInfo = z.infer<typeof networkInfoSchema>;
export type Balance = z.infer<typeof balanceSchema>;
export type BalanceResponse = z.infer<typeof balanceResponseSchema>;
export type BlocksResponse = z.infer<typeof blocksResponseSchema>;
export type TransactionsResponse = z.infer<typeof transactionsResponseSchema>;
export type NetworkStatusResponse = z.infer<typeof networkStatusResponseSchema>;
