import type { Config } from "drizzle-kit";

export default {
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "mysql", // <-- ADICIONE ESTA LINHA
  dbCredentials: {
    url: process.env.DATABASE_URL || "", // Certifique-se de que é 'url' e não 'connectionString' nas versões novas
  },
} satisfies Config;
