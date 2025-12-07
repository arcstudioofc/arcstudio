import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { node } from "@elysiajs/node";
import { cors } from "@elysiajs/cors";
import { z } from "zod";

import { betterAuthPlugins, OpenAPI } from "./http/plugins/better-auth.js";
import { env } from "./lib/env.js";

const app = new Elysia({ adapter: node() })
  .use(
    cors({
      origin: [env.ARC_STUDIO_URL],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .use(
    openapi({
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
      mapJsonSchema: {
        zod: z.toJSONSchema,
      },
    })
  )
  .use(betterAuthPlugins)
  .get("/", () => "ARC Studio, api.", {
    detail: {
      tags: ["Default"],
    },
  })
  .get(
    "/users/:id",
    ({ params, user }) => {
      const userId = params.id;

      const authenticatedUserName = user.name;

      console.log({ authenticatedUserName });

      return { id: userId, name: user.name };
    },
    {
      auth: true,
      detail: {
        summary: "buscar um usuário pelo ID",
        tags: ["Users"],
      },
      params: z.object({
        id: z.string(),
      }),
      response: {
        200: z.object({
          id: z.string(),
          name: z.string(),
        }),
      },
    }
  )
  .listen(3333, ({ hostname, port }) => {
    console.log(`🦊 Elysia is running at ${hostname}:${port}`);
  });
