import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";
import argon2 from "argon2";
import { MongoClient } from 'mongodb';
import { mongodbAdapter } from "better-auth/adapters/mongodb";

import { env } from "./env.js";

const client = new MongoClient(env.MONGODB_URI);
const db = client.db("api");

export const auth = betterAuth({
  basePath: "/auth",
  trustedOrigins: [env.ARC_STUDIO_URL!],
  plugins: [openAPI()],
  database: mongodbAdapter(db, {
    client,
    debugLogs: true
  }),
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    password: {
      hash: async (password: string) => {
        return await argon2.hash(password);
      },
      verify: async ({ password, hash }) => {
        return await argon2.verify(hash, password);
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // logout geral in 7 days
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
});
