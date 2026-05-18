import "dotenv/config";
import postgres from "../node_modules/.pnpm/postgres@3.4.8/node_modules/postgres/src/index.js";

const sql = postgres({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT ?? "5432"),
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  ssl: "require",
  prepare: false,
  connect_timeout: 10,
});

try {
  const rows = await sql`select current_database() as db, now() as now`;
  console.log(JSON.stringify({ ok: true, rows }, null, 2));
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        message: error instanceof Error ? error.message : String(error),
        code: typeof error === "object" && error !== null && "code" in error ? error.code : undefined,
      },
      null,
      2
    )
  );
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
