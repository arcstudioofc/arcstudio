import { Elysia } from "elysia";
import { z } from "zod";

import { betterAuthPlugin } from "../plugins/better-auth.js";

export const userRoutes = new Elysia({ prefix: "/me" })
  .use(betterAuthPlugin)
  .get(
    "/",
    ({ user }) => {
      const { id, name, email, emailVerified, role } = user;

      return {
        id,
        name,
        email,
        emailVerified,
        role,
      };
    },
    {
      auth: true,
      detail: {
        summary: "Get current user profile",
        tags: ["User"],
      },
      response: {
        201: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string().email(),
          emailVerified: z.boolean(),
          role: z.string(),
        }),
        401: z.object({
          message: z.string(),
        }),
      },
    },
  );
