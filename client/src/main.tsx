import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

function loadUmami() {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined;
  const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID as string | undefined;
  if (!endpoint || !websiteId) return;

  const normalizedEndpoint = endpoint.endsWith("/")
    ? endpoint.slice(0, -1)
    : endpoint;
  const src = normalizedEndpoint.endsWith(".js")
    ? normalizedEndpoint
    : `${normalizedEndpoint}/script.js`;

  const script = document.createElement("script");
  script.defer = true;
  script.src = src;
  script.setAttribute("data-website-id", websiteId);
  document.body.appendChild(script);
}

loadUmami();

createRoot(document.getElementById("root")!).render(<App />);
