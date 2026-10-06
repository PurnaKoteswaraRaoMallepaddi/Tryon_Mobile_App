import Constants from "expo-constants";

/**
 * Backend base URL. Defaults to the deployed Atelier API; override for local dev
 * by setting `extra.apiBase` in app.json or the EXPO_PUBLIC_API_BASE env var.
 */
export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ||
  (Constants.expoConfig?.extra as { apiBase?: string } | undefined)?.apiBase ||
  "https://atelier-tryon-delicate-shell-8720.fly.dev";
