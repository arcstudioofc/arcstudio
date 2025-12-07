import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
// import { openAPI } from "better-auth/plugins";

import { auth } from "../../lib/auth.js";

export const betterAuthPlugins = new Elysia({
  adapter: node(),
  name: "better-auth",
})
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers });

        if (!session) {
          return status(401, { message: "Unauthorized." });
        }

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>;
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema());

export const OpenAPI = {
  getPaths: (prefix = "/auth") =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null);

      for (const path of Object.keys(paths)) {
        const original = paths[path];
        if (!original) continue; // <-- FIX: ensure not undefined

        const key = prefix + path;
        reference[key] = original;

        for (const method of Object.keys(original)) {
          const operation = (reference[key] as any)[method];
          operation.tags = ["Better Auth"];
        }
      }

      return reference;
    }) as Promise<any>,
  components: getSchema().then(({ components }) => components) as Promise<any>,
} as const;
