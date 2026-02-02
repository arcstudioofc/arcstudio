import type { User } from "better-auth/types";
import { Elysia } from "elysia";
import { z } from "zod";

import { betterAuthPlugin } from "../plugins/better-auth.js";

export const userRoutes = new Elysia({ prefix: "/me" })
  .use(betterAuthPlugin)
  .get(
    "/",
    ({ user }) => user,
    {
      auth: true,
      detail: {
        summary: "Get current user profile",
        tags: ["User"],
      },
      response: {
        201: z.object<User>(),
        401: z.object({ message: z.string() }),
      },
    },
  );
