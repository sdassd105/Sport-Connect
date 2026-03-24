import postgres from "postgres";
import type { NewsArticle as SharedNewsArticle } from "../shared/types";

type Sport = "futebol" | "basquete" | "volei" | "geral";
type Role = "atleta" | "treinador";
type SkillLevel = "iniciante" | "intermediario" | "avancado";

type CreateGameInput = {
  createdBy: number;
  sport: "futebol" | "basquete" | "volei";
  title: string;
  description?: string;
  locationId?: number;
  customLocation?: string;
  gameDate: Date;
  maxPlayers?: number;
  currentPlayers?: number;
  skillLevel?: SkillLevel;
};

type SaveNewsArticleInput = Omit<SharedNewsArticle, "content"> & {
  id?: string;
  content?: string;
};

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function createSqlClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    return postgres(databaseUrl, {
      prepare: false,
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
    prepare: false,
  });
}

const sql = createSqlClient();

function asPtDate(value: string | Date | null | undefined) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-PT");
}

function firstRow<T>(rows: T[]) {
  return rows[0];
}

// ===== USERS =====

export async function getUserById(id: number) {
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

export async function getUserByEmail(email: string) {
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

export async function createUser(data: {
  name?: string | null;
  email?: string | null;
  passwordHash?: string | null;
  role?: Role | null;
  profilePhoto?: string | null;
}) {
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

export async function updateUserBasics(data: {
  id: number;
  name: string;
  email: string;
  profilePhoto?: string | null;
}) {
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

// ===== PLAYER PROFILES =====

export async function getPlayerProfile(userId: number) {
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

export async function upsertPlayerProfile(data: {
  userId: number;
  position?: string;
  sport: "futebol" | "basquete" | "volei";
  yearsOfExperience?: number;
  objective?: "profissional" | "amador";
  specialty?: string;
  age?: number;
  bio?: string;
}) {
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

// ===== GAMES / LOCATIONS / TEAMS / ANNOUNCEMENTS =====

export async function getGamesBySport(sport: string) {
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

export async function getLocationsBySportAndCity(sport: string, city: string) {
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

export async function createGame(data: CreateGameInput) {
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

export async function getTeamsBySport(sport: string) {
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

export async function getAnnouncementsByTypeAndSport(type: string, sport: string) {
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

// ===== NEWS =====

export async function getNewsBySport(sport: string) {
  const rows =
    sport === "geral"
      ? await sql`
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
        `
      : await sql`
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
    category: (n.sport ?? "geral") as Sport,
    url: String(n.sourceUrl ?? "#"),
  }));
}

export async function saveNewsArticle(article: SaveNewsArticleInput) {
  const parsedDate = article.date ? new Date(article.date) : null;
  const publishedAt =
    parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;

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
