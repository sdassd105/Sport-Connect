import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { z } from "zod";
import { saveNewsArticle } from "./db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  // Return JSON on invalid JSON bodies (avoid default HTML error page)
  app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError) {
      res.status(400).json({ ok: false, error: "invalid_json" });
      return;
    }
    next();
  });

  const makeNewsSchema = z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string(),
    content: z.string().optional(),
    image: z.string(),
    date: z.string(),
    source: z.string(),
    category: z.enum(["futebol", "basquete", "volei", "geral"]),
    url: z.string(),
  });

  // Webhook simples para o Make: envia JSON da noticia e grava no MySQL.
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
      if (err instanceof z.ZodError) {
        res.status(400).json({ ok: false, error: "invalid_payload", details: err.issues });
        return;
      }
      console.error(err);
      const isProd = process.env.NODE_ENV === "production";
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ ok: false, error: "internal_error", ...(isProd ? {} : { message }) });
    }
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
    })
  );

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3001;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
