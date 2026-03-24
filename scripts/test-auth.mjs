import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

const baseUrl = process.env.API_URL ?? "http://localhost:3001";
const email = `teste-${Date.now()}@mail.com`;
const password = "123456";

const trpc = createTRPCProxyClient({
  links: [
    httpBatchLink({
      url: `${baseUrl}/api/trpc`,
    }),
  ],
});

async function main() {
  try {
    const registered = await trpc.auth.register.mutate({
      name: "Teste",
      email,
      password,
      role: "atleta",
    });

    console.log("auth.register ok:", registered);
  } catch (error) {
    console.error("auth.register error:", error);
    process.exit(1);
  }

  try {
    const loggedIn = await trpc.auth.login.mutate({
      email,
      password,
    });

    console.log("auth.login ok:", loggedIn);
  } catch (error) {
    console.error("auth.login error:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
