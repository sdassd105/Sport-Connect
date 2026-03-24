import { Capacitor } from "@capacitor/core";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../server/routers";

function getTrpcUrl() {
  const configuredBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");

  if (Capacitor.isNativePlatform()) {
    return configuredBaseUrl ? `${configuredBaseUrl}/api/trpc` : "http://10.0.2.2:3001/api/trpc";
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
