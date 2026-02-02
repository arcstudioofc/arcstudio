import { Elysia } from "elysia";

export const indexRoutes = new Elysia()
  .get(
    "/",
    () => ({
      message: "Hello, ARC.",
    }),
    {
      detail: {
        summary: "Health check",
        tags: ["Default"],
      },
    },
  );
