import bcrypt from "bcryptjs";
import { z } from "zod";
import * as db from "./db";
import { publicProcedure, router } from "./trpc";

const newsArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  content: z.string().optional(),
  image: z.string(),
  date: z.string(),
  source: z.string(),
  category: z.enum(["futebol", "basquete", "volei", "geral"]),
  url: z.string(),
});

export const appRouter = router({
  auth: router({
    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          password: z.string().min(6),
          role: z.enum(["atleta", "treinador"]),
        })
      )
      .mutation(async ({ input }) => {
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new Error("Este e-mail ja esta registado.");
        }

        const passwordHash = await bcrypt.hash(input.password, 10);

        await db.createUser({
          name: input.name,
          email: input.email,
          passwordHash,
          role: input.role,
        });

        const createdUser = await db.getUserByEmail(input.email);
        if (!createdUser) {
          throw new Error("Nao foi possivel criar o utilizador.");
        }

        return {
          id: createdUser.id,
          name: createdUser.name ?? "",
          email: createdUser.email ?? "",
          role: createdUser.role ?? "atleta",
          profilePhoto: createdUser.profilePhoto ?? undefined,
        };
      }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const user = await db.getUserByEmail(input.email);
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
          profilePhoto: user.profilePhoto ?? undefined,
        };
      }),
  }),

  sports: router({
    getGamesBySport: publicProcedure
      .input(z.object({ sport: z.enum(["futebol", "basquete", "volei"]) }))
      .query(async ({ input }) => {
        return db.getGamesBySport(input.sport);
      }),

    getLocationsBySportAndCity: publicProcedure
      .input(z.object({ sport: z.enum(["futebol", "basquete", "volei"]), city: z.string() }))
      .query(async ({ input }) => {
        return db.getLocationsBySportAndCity(input.sport, input.city);
      }),

    createGame: publicProcedure
      .input(
        z.object({
          createdBy: z.number(),
          sport: z.enum(["futebol", "basquete", "volei"]),
          title: z.string(),
          description: z.string().optional(),
          locationId: z.number().optional(),
          customLocation: z.string().optional(),
          gameDate: z.date(),
          maxPlayers: z.number().optional(),
          skillLevel: z.enum(["iniciante", "intermediario", "avancado"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createGame({
          ...input,
          currentPlayers: 1,
        });
      }),
  }),

  news: router({
    getNewsBySport: publicProcedure
      .input(z.object({ sport: z.enum(["futebol", "basquete", "volei", "geral"]) }))
      .query(async ({ input }) => {
        return db.getNewsBySport(input.sport);
      }),

    receiveNewsFromMake: publicProcedure
      .input(newsArticleSchema)
      .mutation(async ({ input }) => {
        return db.saveNewsArticle(input);
      }),
  }),

  tm: router({
    getAnnouncementsByType: publicProcedure
      .input(
        z.object({
          type: z.enum(["procurando_time", "procurando_jogador", "procurando_treinador"]),
        })
      )
      .query(async ({ input }) => {
        return db.getAnnouncementsByType(input.type);
      }),

    getTeamsBySport: publicProcedure
      .input(z.object({ sport: z.enum(["futebol", "basquete", "volei"]) }))
      .query(async ({ input }) => {
        return db.getTeamsBySport(input.sport);
      }),

    getAnnouncementsByTypeAndSport: publicProcedure
      .input(
        z.object({
          type: z.enum(["procurando_time", "procurando_jogador", "procurando_treinador"]),
          sport: z.enum(["futebol", "basquete", "volei"]),
        })
      )
      .query(async ({ input }) => {
        return db.getAnnouncementsByTypeAndSport(input.type, input.sport);
      }),

    createAnnouncement: publicProcedure
      .input(
        z.object({
          userId: z.number(),
          type: z.enum(["procurando_time", "procurando_jogador", "procurando_treinador"]),
          sport: z.enum(["futebol", "basquete", "volei"]),
          title: z.string().min(1),
          description: z.string().optional(),
          position: z.string().optional(),
          skillLevel: z.enum(["iniciante", "intermediario", "avancado"]).optional(),
          city: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createAnnouncement(input);
      }),
  }),

  profile: router({
    getUserBasics: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getUserById(input.userId);
      }),

    getPlayerProfile: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getPlayerProfile(input.userId);
      }),

    updateUserBasics: publicProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1),
          email: z.string().email(),
          profilePhoto: z.string().nullable().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.updateUserBasics(input);
      }),

    updatePlayerProfile: publicProcedure
      .input(
        z.object({
          userId: z.number(),
          position: z.string().optional(),
          sport: z.enum(["futebol", "basquete", "volei"]),
          yearsOfExperience: z.number().optional(),
          objective: z.enum(["profissional", "amador"]).optional(),
          specialty: z.string().optional(),
          age: z.number().optional(),
          bio: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.upsertPlayerProfile(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
