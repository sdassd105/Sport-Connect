import { Capacitor } from "@capacitor/core";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../server/routers";

function getTrpcUrl() {
  const configuredBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");

  // In development (Vite dev server), prefer same-origin so the Vite `/api` proxy works
  // even if VITE_API_URL is set for production.
  if (import.meta.env.DEV && !Capacitor.isNativePlatform()) {
    return "/api/trpc";
  }

  if (configuredBaseUrl) {
    return `${configuredBaseUrl}/api/trpc`;
  }

  if (Capacitor.isNativePlatform()) {
    return "http://10.0.2.2:3001/api/trpc";
  }

  return "/api/trpc";
}

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: getTrpcUrl(),
    }),
  ],
});
