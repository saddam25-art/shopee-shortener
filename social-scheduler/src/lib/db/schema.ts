import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const connectedAccounts = sqliteTable("connected_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(), // 'facebook' | 'instagram' | 'tiktok' | 'twitter'
  platformAccountId: text("platform_account_id").notNull(),
  accountName: text("account_name").notNull(),
  accountHandle: text("account_handle"),
  avatarUrl: text("avatar_url"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: integer("token_expires_at", { mode: "timestamp" }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  mediaUrls: text("media_urls"), // JSON array of media URLs
  scheduledAt: integer("scheduled_at", { mode: "timestamp" }).notNull(),
  status: text("status").notNull().default("queued"), // 'queued' | 'posting' | 'posted' | 'failed'
  errorMessage: text("error_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const postAccounts = sqliteTable("post_accounts", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  connectedAccountId: text("connected_account_id").notNull().references(() => connectedAccounts.id, { onDelete: "cascade" }),
  platformPostId: text("platform_post_id"), // ID returned by platform after posting
  status: text("status").notNull().default("queued"), // 'queued' | 'posting' | 'posted' | 'failed'
  errorMessage: text("error_message"),
  postedAt: integer("posted_at", { mode: "timestamp" }),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ConnectedAccount = typeof connectedAccounts.$inferSelect;
export type NewConnectedAccount = typeof connectedAccounts.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostAccount = typeof postAccounts.$inferSelect;
export type NewPostAccount = typeof postAccounts.$inferInsert;
