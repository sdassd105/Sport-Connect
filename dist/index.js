// server/index.ts
import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/routers.ts
import bcrypt from "bcryptjs";
import { z } from "zod";

// server/db.ts
import postgres from "postgres";
function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}
function createSqlClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    return postgres(databaseUrl, {
      prepare: false
    });
  }
  const host = requiredEnv("DATABASE_HOST");
  const port = Number(process.env.DATABASE_PORT ?? "5432");
  const database = requiredEnv("DATABASE_NAME");
  const username = requiredEnv("DATABASE_USER");
  const password = requiredEnv("DATABASE_PASSWORD");
  return postgres({
    host,
    port,
    database,
    username,
    password,
    ssl: "require",
    prepare: false
  });
}
var sql = createSqlClient();
function asPtDate(value) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-PT");
}
function firstRow(rows) {
  return rows[0];
}
async function getUserById(id) {
  const rows = await sql`
    select
      id,
      name,
      email,
      password_hash as "passwordHash",
      role,
      profile_photo as "profilePhoto",
      created_at as "createdAt",
      updated_at as "updatedAt"
    from users
    where id = ${id}
    limit 1
  `;
  return firstRow(rows);
}
async function getUserByEmail(email) {
  const rows = await sql`
    select
      id,
      name,
      email,
      password_hash as "passwordHash",
      role,
      profile_photo as "profilePhoto",
      created_at as "createdAt",
      updated_at as "updatedAt"
    from users
    where email = ${email}
    limit 1
  `;
  return firstRow(rows);
}
async function createUser(data) {
  const rows = await sql`
    insert into users (
      name,
      email,
      password_hash,
      role,
      profile_photo
    ) values (
      ${data.name ?? null},
      ${data.email ?? null},
      ${data.passwordHash ?? null},
      ${data.role ?? "atleta"},
      ${data.profilePhoto ?? null}
    )
    returning
      id,
      name,
      email,
      password_hash as "passwordHash",
      role,
      profile_photo as "profilePhoto",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;
  return firstRow(rows);
}
async function updateUserBasics(data) {
  const rows = await sql`
    update users
    set
      name = ${data.name},
      email = ${data.email},
      profile_photo = ${data.profilePhoto ?? null},
      updated_at = current_timestamp
    where id = ${data.id}
    returning
      id,
      name,
      email,
      password_hash as "passwordHash",
      role,
      profile_photo as "profilePhoto",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;
  return firstRow(rows);
}
async function getPlayerProfile(userId) {
  const rows = await sql`
    select
      id,
      user_id as "userId",
      position,
      sport,
      years_of_experience as "yearsOfExperience",
      objective,
      specialty,
      age,
      bio,
      created_at as "createdAt",
      updated_at as "updatedAt"
    from player_profiles
    where user_id = ${userId}
    limit 1
  `;
  return firstRow(rows);
}
async function upsertPlayerProfile(data) {
  const rows = await sql`
    insert into player_profiles (
      user_id,
      position,
      sport,
      years_of_experience,
      objective,
      specialty,
      age,
      bio
    ) values (
      ${data.userId},
      ${data.position ?? null},
      ${data.sport},
      ${data.yearsOfExperience ?? null},
      ${data.objective ?? "amador"},
      ${data.specialty ?? null},
      ${data.age ?? null},
      ${data.bio ?? null}
    )
    on conflict (user_id) do update set
      position = excluded.position,
      sport = excluded.sport,
      years_of_experience = excluded.years_of_experience,
      objective = excluded.objective,
      specialty = excluded.specialty,
      age = excluded.age,
      bio = excluded.bio,
      updated_at = current_timestamp
    returning
      id,
      user_id as "userId",
      position,
      sport,
      years_of_experience as "yearsOfExperience",
      objective,
      specialty,
      age,
      bio,
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;
  return firstRow(rows);
}
async function getGamesBySport(sport) {
  return sql`
    select
      id,
      created_by as "createdBy",
      sport,
      title,
      description,
      location_id as "locationId",
      custom_location as "customLocation",
      game_date as "gameDate",
      max_players as "maxPlayers",
      skill_level as "skillLevel",
      status,
      image_url as "imageUrl",
      created_at as "createdAt",
      updated_at as "updatedAt"
    from games
    where sport = ${sport}
    order by game_date asc
  `;
}
async function getLocationsBySportAndCity(sport, city) {
  return sql`
    select
      id,
      name,
      sport,
      address,
      latitude,
      longitude,
      city,
      state,
      description,
      image_url as "imageUrl",
      created_at as "createdAt",
      updated_at as "updatedAt"
    from sport_locations
    where sport = ${sport}
      and city = ${city}
    order by name asc
  `;
}
async function createGame(data) {
  const rows = await sql`
    insert into games (
      created_by,
      sport,
      title,
      description,
      location_id,
      custom_location,
      game_date,
      max_players,
      skill_level
    ) values (
      ${data.createdBy},
      ${data.sport},
      ${data.title},
      ${data.description ?? null},
      ${data.locationId ?? null},
      ${data.customLocation ?? null},
      ${data.gameDate},
      ${data.maxPlayers ?? null},
      ${data.skillLevel ?? "intermediario"}
    )
    returning
      id,
      created_by as "createdBy",
      sport,
      title,
      description,
      location_id as "locationId",
      custom_location as "customLocation",
      game_date as "gameDate",
      max_players as "maxPlayers",
      skill_level as "skillLevel",
      status,
      image_url as "imageUrl",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;
  return firstRow(rows);
}
async function getTeamsBySport(sport) {
  return sql`
    select
      id,
      name,
      sport,
      description,
      city,
      logo_url as "logoUrl",
      founded_year as "foundedYear",
      created_by as "createdBy",
      is_recruiting as "isRecruiting",
      created_at as "createdAt",
      updated_at as "updatedAt"
    from teams
    where sport = ${sport}
    order by name asc
  `;
}
async function getAnnouncementsByTypeAndSport(type, sport) {
  return sql`
    select
      id,
      user_id as "userId",
      type,
      sport,
      title,
      description,
      position,
      skill_level as "skillLevel",
      city,
      is_active as "isActive",
      created_at as "createdAt",
      updated_at as "updatedAt"
    from announcements
    where type = ${type}
      and sport = ${sport}
      and is_active = true
    order by created_at desc
  `;
}
async function getNewsBySport(sport) {
  const rows = sport === "geral" ? await sql`
          select
            id,
            title,
            description,
            content,
            sport,
            image_url as "imageUrl",
            source_url as "sourceUrl",
            source,
            published_at as "publishedAt",
            created_at as "createdAt"
          from news
          order by published_at desc nulls last
          limit 10
        ` : await sql`
          select
            id,
            title,
            description,
            content,
            sport,
            image_url as "imageUrl",
            source_url as "sourceUrl",
            source,
            published_at as "publishedAt",
            created_at as "createdAt"
          from news
          where sport = ${sport}
          order by published_at desc nulls last
          limit 10
        `;
  return rows.map((n) => ({
    id: String(n.id),
    title: String(n.title ?? ""),
    description: String(n.description ?? ""),
    content: String(n.content ?? ""),
    image: String(n.imageUrl ?? ""),
    date: asPtDate(n.publishedAt),
    source: String(n.source ?? ""),
    category: n.sport ?? "geral",
    url: String(n.sourceUrl ?? "#")
  }));
}
async function saveNewsArticle(article) {
  const parsedDate = article.date ? new Date(article.date) : null;
  const publishedAt = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;
  const rows = await sql`
    insert into news (
      title,
      description,
      content,
      sport,
      image_url,
      source_url,
      source,
      published_at
    ) values (
      ${article.title},
      ${article.description},
      ${article.content ?? null},
      ${article.category},
      ${article.image},
      ${article.url},
      ${article.source},
      ${publishedAt}
    )
    returning
      id,
      title,
      description,
      content,
      sport,
      image_url as "imageUrl",
      source_url as "sourceUrl",
      source,
      published_at as "publishedAt",
      created_at as "createdAt"
  `;
  return firstRow(rows);
}

// server/trpc.ts
import { initTRPC } from "@trpc/server";
var t = initTRPC.create();
var router = t.router;
var publicProcedure = t.procedure;

// server/routers.ts
var newsArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  content: z.string().optional(),
  image: z.string(),
  date: z.string(),
  source: z.string(),
  category: z.enum(["futebol", "basquete", "volei", "geral"]),
  url: z.string()
});
var appRouter = router({
  auth: router({
    register: publicProcedure.input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["atleta", "treinador"])
      })
    ).mutation(async ({ input }) => {
      const existingUser = await getUserByEmail(input.email);
      if (existingUser) {
        throw new Error("Este e-mail ja esta registado.");
      }
      const passwordHash = await bcrypt.hash(input.password, 10);
      await createUser({
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role
      });
      const createdUser = await getUserByEmail(input.email);
      if (!createdUser) {
        throw new Error("Nao foi possivel criar o utilizador.");
      }
      return {
        id: createdUser.id,
        name: createdUser.name ?? "",
        email: createdUser.email ?? "",
        role: createdUser.role ?? "atleta",
        profilePhoto: createdUser.profilePhoto ?? void 0
      };
    }),
    login: publicProcedure.input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1)
      })
    ).mutation(async ({ input }) => {
      const user = await getUserByEmail(input.email);
      if (!user?.passwordHash) {
        throw new Error("Credenciais invalidas.");
      }
      const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error("Credenciais invalidas.");
      }
      return {
        id: user.id,
        name: user.name ?? "",
        email: user.email ?? "",
        role: user.role ?? "atleta",
        profilePhoto: user.profilePhoto ?? void 0
      };
    })
  }),
  sports: router({
    getGamesBySport: publicProcedure.input(z.object({ sport: z.enum(["futebol", "basquete", "volei"]) })).query(async ({ input }) => {
      return getGamesBySport(input.sport);
    }),
    getLocationsBySportAndCity: publicProcedure.input(z.object({ sport: z.enum(["futebol", "basquete", "volei"]), city: z.string() })).query(async ({ input }) => {
      return getLocationsBySportAndCity(input.sport, input.city);
    }),
    createGame: publicProcedure.input(
      z.object({
        createdBy: z.number(),
        sport: z.enum(["futebol", "basquete", "volei"]),
        title: z.string(),
        description: z.string().optional(),
        locationId: z.number().optional(),
        customLocation: z.string().optional(),
        gameDate: z.date(),
        maxPlayers: z.number().optional(),
        skillLevel: z.enum(["iniciante", "intermediario", "avancado"]).optional()
      })
    ).mutation(async ({ input }) => {
      return createGame({
        ...input,
        currentPlayers: 1
      });
    })
  }),
  news: router({
    getNewsBySport: publicProcedure.input(z.object({ sport: z.enum(["futebol", "basquete", "volei", "geral"]) })).query(async ({ input }) => {
      return getNewsBySport(input.sport);
    }),
    receiveNewsFromMake: publicProcedure.input(newsArticleSchema).mutation(async ({ input }) => {
      return saveNewsArticle(input);
    })
  }),
  tm: router({
    getTeamsBySport: publicProcedure.input(z.object({ sport: z.enum(["futebol", "basquete", "volei"]) })).query(async ({ input }) => {
      return getTeamsBySport(input.sport);
    }),
    getAnnouncementsByTypeAndSport: publicProcedure.input(
      z.object({
        type: z.enum(["procurando_time", "procurando_jogador", "procurando_treinador"]),
        sport: z.enum(["futebol", "basquete", "volei"])
      })
    ).query(async ({ input }) => {
      return getAnnouncementsByTypeAndSport(input.type, input.sport);
    })
  }),
  profile: router({
    getUserBasics: publicProcedure.input(z.object({ userId: z.number() })).query(async ({ input }) => {
      return getUserById(input.userId);
    }),
    getPlayerProfile: publicProcedure.input(z.object({ userId: z.number() })).query(async ({ input }) => {
      return getPlayerProfile(input.userId);
    }),
    updateUserBasics: publicProcedure.input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        email: z.string().email(),
        profilePhoto: z.string().nullable().optional()
      })
    ).mutation(async ({ input }) => {
      return updateUserBasics(input);
    }),
    updatePlayerProfile: publicProcedure.input(
      z.object({
        userId: z.number(),
        position: z.string().optional(),
        sport: z.enum(["futebol", "basquete", "volei"]),
        yearsOfExperience: z.number().optional(),
        objective: z.enum(["profissional", "amador"]).optional(),
        specialty: z.string().optional(),
        age: z.number().optional(),
        bio: z.string().optional()
      })
    ).mutation(async ({ input }) => {
      return upsertPlayerProfile(input);
    })
  })
});

// server/index.ts
import { z as z2 } from "zod";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json());
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });
  app.use((err, _req, res, next) => {
    if (err instanceof SyntaxError) {
      res.status(400).json({ ok: false, error: "invalid_json" });
      return;
    }
    next();
  });
  const makeNewsSchema = z2.object({
    id: z2.string().optional(),
    title: z2.string(),
    description: z2.string(),
    content: z2.string().optional(),
    image: z2.string(),
    date: z2.string(),
    source: z2.string(),
    category: z2.enum(["futebol", "basquete", "volei", "geral"]),
    url: z2.string()
  });
  app.get("/api/webhooks/make/news", (_req, res) => {
    res.status(405).json({ ok: false, error: "method_not_allowed", expected: "POST" });
  });
  app.post("/api/webhooks/make/news", async (req, res) => {
    try {
      const secret = process.env.MAKE_WEBHOOK_SECRET;
      if (secret) {
        const header = String(req.header("x-make-secret") ?? "");
        if (header !== secret) {
          res.status(401).json({ ok: false, error: "unauthorized" });
          return;
        }
      }
      const payload = makeNewsSchema.parse(req.body);
      await saveNewsArticle(payload);
      res.json({ ok: true });
    } catch (err) {
      if (err instanceof z2.ZodError) {
        res.status(400).json({ ok: false, error: "invalid_payload", details: err.issues });
        return;
      }
      console.error(err);
      const isProd = process.env.NODE_ENV === "production";
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ ok: false, error: "internal_error", ...isProd ? {} : { message } });
    }
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter
    })
  );
  const staticPath = process.env.NODE_ENV === "production" ? path.resolve(__dirname, "public") : path.resolve(__dirname, "..", "dist", "public");
  app.use(express.static(staticPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
  const port = process.env.PORT || 3001;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
