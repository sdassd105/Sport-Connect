import { Capacitor } from "@capacitor/core";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../server/routers";

function getTrpcUrl() {
  const configuredApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");

  if (!Capacitor.isNativePlatform()) {
    return "/api/trpc";
  }

  if (configuredApiUrl) {
    return configuredApiUrl.endsWith("/api/trpc")
      ? configuredApiUrl
      : `${configuredApiUrl}/api/trpc`;
  }

  return "http://10.0.2.2:3001/api/trpc";
}

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: getTrpcUrl(),
    }),
  ],
});
