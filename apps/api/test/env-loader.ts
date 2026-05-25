// NestJS ConfigModule reads .env from disk. We handle .env swapping in globalSetup
// to avoid race conditions between parallel test workers. Here we just load
// .env.test vars into process.env for the globalSetup/globalTeardown processes.
import * as path from "path";
import * as fs from "fs";

const envPath = path.resolve(__dirname, "../.env.test");
const content = fs.readFileSync(envPath, "utf-8");
for (const line of content.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const rawValue = trimmed.slice(eqIdx + 1).trim();
  const value = rawValue.replace(/^["']|["']$/g, "");
  process.env[key] = value;
}
