import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, serial } from "drizzle-orm/mysql-core";
/**
 * Tabela de usuários
 */
export const games = mysqlTable('games', {
  id: serial('id').primaryKey(),
  sport: varchar('sport', { length: 255 }).notNull(),
  // ... outras colunas
});

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }).unique(),
  password: varchar("password", { length: 255 }), // Adicionado para login
  role: mysqlEnum("role", ["atleta", "treinador"]).default("atleta"), // Adicionado para separação de perfis
  profilePhoto: text("profile_photo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de perfis de jogadores/treinadores
 */
export const playerProfiles = mysqlTable("player_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  position: varchar("position", { length: 100 }), 
  sport: mysqlEnum("sport", ["futebol", "basquete", "volei"]).notNull(),
  yearsOfExperience: int("years_of_experience"),
  objective: mysqlEnum("objective", ["profissional", "amador"]).default("amador"),
  specialty: text("specialty"),
  age: int("age"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type PlayerProfile = typeof playerProfiles.$inferSelect;
export type InsertPlayerProfile = typeof playerProfiles.$inferInsert;

/**
 * Tabela de times
 */
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sport: mysqlEnum("sport", ["futebol", "basquete", "volei"]).notNull(),
  description: text("description"),
  city: varchar("city", { length: 100 }),
  logoUrl: text("logo_url"),
  foundedYear: int("founded_year"),
  createdBy: int("created_by").notNull().references(() => users.id), // Normalmente o treinador
  isRecruiting: boolean("is_recruiting").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

/**
 * Solicitações de entrada em times
 */
export const teamApplications = mysqlTable("team_applications", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("team_id").notNull().references(() => teams.id),
  userId: int("user_id").notNull().references(() => users.id),
  status: mysqlEnum("status", ["pendente", "aceito", "recusado"]).default("pendente"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Tabela de Torneios
 */
export const tournaments = mysqlTable("tournaments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sport: mysqlEnum("sport", ["futebol", "basquete", "volei"]).notNull(),
  type: mysqlEnum("type", ["amador", "profissional"]).notNull(),
  description: text("description"),
  location: text("location"),
  startDate: timestamp("start_date").notNull(),
  maxTeams: int("max_teams"),
  createdBy: int("created_by").notNull().references(() => users.id),
  status: mysqlEnum("status", ["inscricoes_abertas", "em_andamento", "finalizado"]).default("inscricoes_abertas"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Tabela de notícias
 */
export const news = mysqlTable("news", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  content: text("content"), // Adicionado para armazenar o conteúdo completo da notícia
  sport: mysqlEnum("sport", ["futebol", "basquete", "volei", "geral"]).default("geral"),
  imageUrl: text("image_url"),
  source: varchar("source", { length: 255 }), // Adicionado para armazenar a fonte da notícia
  sourceUrl: text("source_url"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type News = typeof news.$inferSelect;
export type InsertNews = typeof news.$inferInsert;

