import { z } from 'zod';

const envSchema = z.object({
  BETTER_AUTH_SECRET: z.string("Invalid BETTER_AUTH_SECRET").min(32).max(32),
  BETTER_AUTH_URL: z.string("Invalid BETTER_AUTH_URL").default("http://localhost:3333"),
  BETTER_AUTH_DOMAIN: z.string().optional(),

  DEFAULT_PORT: z.coerce.number("Invalid port").default(3333),

  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRECT: z.string(),

  SPAWNERX_URL: z.url(),
  ARCSTUDIO_AUTH_URL: z.url(),
  ARCSTUDIO_DEV_URL: z.url(),
  ARCSTUDIO_URL: z.url(),

  MONGODB_URI: z.string().startsWith("mongodb+srv://"),
  MONGODB_DB_NAME: z.string(),
});

export const env = envSchema.parse(process.env);