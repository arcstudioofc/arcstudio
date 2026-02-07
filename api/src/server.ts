import { openapi } from "@elysiajs/openapi";
import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import z from "zod";

import { env } from "./config/env.js";
import { betterAuthPlugin, OpenAPI } from "./http/plugins/better-auth.js";
import { logger } from "./utils/logger.js";
import { indexRoutes } from "./http/routes/index.js";
import { userRoutes } from "./http/routes/user.js";
import { aboutRoutes } from "./http/routes/about.js";
import { usersRoutes } from "./http/routes/users.js";
import { changelogRoutes } from "./http/routes/changelogs.js";
import { officialProjectRoutes } from "./http/routes/official-projects.js";
import { Package } from "./config/package.js";

const app = new Elysia({
  name: "ARC Studio, API.",
  adapter: node()
})
  .use(
    cors({
      origin: [env.ARCSTUDIO_AUTH_URL, env.ARCSTUDIO_URL, env.ARCSTUDIO_DEV_URL],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(
    openapi({
      mapJsonSchema: {
        zod: z.toJSONSchema,
      },
      documentation: {
        info: {
          title: "ARC Studio, API.",
          version: Package.version,
          description: "Principal API for ARC Studio, Inc.",
        },
        components: (await OpenAPI.components) as any,
        paths: (await OpenAPI.getPaths()) as any,
        tags: [
          { name: "Default", description: "Default routes" },
          { name: "User", description: "User related routes" },
          { name: "Changelog", description: "Changelog routes" },
          { name: "Official Projects", description: "Official projects routes" },
          {
            name: "Auth system",
            description: "System authentication for users in routes",
          },
        ],
      },
    }),
  )
  .use(betterAuthPlugin)
  .use(indexRoutes)
  .use(userRoutes)
  .use(usersRoutes)
  .use(aboutRoutes)
  .use(changelogRoutes)
  .use(officialProjectRoutes)
  .listen({ port: env.DEFAULT_PORT }, (info) => {
    logger(`🔥 api is running at ${info.hostname}:${info.port}`);
  });

export type App = typeof app;
