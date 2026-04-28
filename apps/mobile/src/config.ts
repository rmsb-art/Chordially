import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

export type AppEnv = "development" | "staging" | "production";

export interface MobileConfig {
  env: AppEnv;
  apiUrl: string;
  wsUrl: string;
  stellarNetwork: "testnet" | "mainnet";
  analyticsEnabled: boolean;
}

const ENV_CONFIGS: Record<AppEnv, Omit<MobileConfig, "env">> = {
  development: {
    apiUrl: "http://localhost:3001",
    wsUrl: "ws://localhost:3001",
    stellarNetwork: "testnet",
    analyticsEnabled: false,
  },
  staging: {
    apiUrl: "https://api.staging.chordially.com",
    wsUrl: "wss://api.staging.chordially.com",
    stellarNetwork: "testnet",
    analyticsEnabled: true,
  },
  production: {
    apiUrl: "https://api.chordially.com",
    wsUrl: "wss://api.chordially.com",
    stellarNetwork: "mainnet",
    analyticsEnabled: true,
  },
};

function resolveEnv(): AppEnv {
  const raw = Constants.expoConfig?.extra?.APP_ENV ?? process.env.APP_ENV;
  if (raw === "staging" || raw === "production") return raw;
  return "development";
}

export function getMobileConfig(): MobileConfig {
  const env = resolveEnv();
  return { env, ...ENV_CONFIGS[env] };
}

// ── Secure secret helpers ────────────────────────────────────────────────────

const SECRET_KEYS = ["auth_token", "stellar_secret_key"] as const;
type SecretKey = (typeof SECRET_KEYS)[number];

export async function saveSecret(key: SecretKey, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function loadSecret(key: SecretKey): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

export async function clearSecrets(): Promise<void> {
  await Promise.all(SECRET_KEYS.map((k) => SecureStore.deleteItemAsync(k)));
}
