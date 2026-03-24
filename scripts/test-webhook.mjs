// Simple local webhook test without copy/paste pain in PowerShell.
// Usage:
//   node scripts/test-webhook.mjs
//   WEBHOOK_URL=http://localhost:3001/api/webhooks/make/news node scripts/test-webhook.mjs

const webhookUrl =
  process.env.WEBHOOK_URL ?? "http://localhost:3001/api/webhooks/make/news";

const payload = {
  title: "Noticia teste",
  description: "Descricao",
  content: "Conteudo",
  image: "",
  date: new Date().toISOString(),
  source: "local",
  category: "geral",
  url: "#",
};

async function main() {
  let res;
  try {
    res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Falhou a ligar ao servidor:", webhookUrl);
    console.error(String(err));
    console.error("Confirma que o backend esta a correr: `pnpm run dev:api`");
    process.exit(1);
  }

  const text = await res.text();
  console.log("status:", res.status);
  console.log("body:", text);

  if (!res.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

