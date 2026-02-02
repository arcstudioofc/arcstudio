import { Elysia } from "elysia";
import { Package } from "../../config/package.js";


export const aboutRoutes = new Elysia({ prefix: "/about" })
  .get(
    "/",
    () => ({
      name: Package.name,
      version: Package.version,
      author: Package.author,
    }),
    {
      detail: {
        summary: "About the API",
        tags: ["Default"],
      },
    },
  );
