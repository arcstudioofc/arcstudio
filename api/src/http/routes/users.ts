import { Elysia } from "elysia";
import { z } from "zod";
import { getOrgAdapter } from "better-auth/plugins/organization";

import { auth } from "../../config/auth.js";
import { db } from "../../database/client.js";
import { betterAuthPlugin } from "../plugins/better-auth.js";

type UserDoc = {
  _id: string;
  id?: string;
  name?: string;
  username?: string;
  image?: string | null;
  role?: string;
};

const usersCollection = db.collection<UserDoc>("user");

export const usersRoutes = new Elysia({ prefix: "/users" })
  .use(betterAuthPlugin)
  .get(
    "/search",
    async ({ query }) => {
      const rawQuery =
        typeof query?.q === "string"
          ? query.q
          : typeof query?.query === "string"
            ? query.query
            : "";
      const normalizedQuery = rawQuery.trim();

      if (normalizedQuery.length < 2) return [];

      const limitValue =
        typeof query?.limit === "string" ? Number(query.limit) : undefined;
      const limit =
        typeof limitValue === "number" && Number.isFinite(limitValue)
        ? Math.min(Math.max(1, limitValue), 20)
        : 8;

      const escapeRegex = (value: string) =>
        value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const safeQuery = escapeRegex(normalizedQuery);
      const textRegex = new RegExp(safeQuery, "i");
      const idRegex = new RegExp(safeQuery);

      const projection = { _id: 1, name: 1, username: 1, image: 1, role: 1 };

      const [byName, byUsername, byId] = await Promise.all([
        usersCollection
          .find({ name: { $regex: textRegex } })
          .project(projection)
          .limit(limit)
          .toArray(),
        usersCollection
          .find({ username: { $regex: textRegex } })
          .project(projection)
          .limit(limit)
          .toArray(),
        usersCollection
          .find({ _id: { $regex: idRegex } })
          .project(projection)
          .limit(Math.min(5, limit))
          .toArray(),
      ]);

      const merged = new Map<string, typeof byName[number]>();
      [...byName, ...byUsername, ...byId].forEach((user) => {
        const id = String(user._id ?? user.id ?? "");
        if (!id) return;
        if (!merged.has(id)) {
          merged.set(id, user);
        }
      });

      return Array.from(merged.values())
        .slice(0, limit)
        .map((user) => ({
          id: String(user._id ?? user.id ?? ""),
          name: user.name,
          username: user.username,
          image: user.image ?? null,
          role: user.role,
        }));
    },
    {
      detail: {
        summary: "Search users",
        tags: ["User"],
      },
      response: {
        200: z.array(
          z.object({
            id: z.string(),
            name: z.string().optional(),
            username: z.string().optional(),
            image: z.string().nullable().optional(),
            role: z.string().optional(),
          }),
        ),
      },
    },
  )
  .get(
    "/:id/organizations",
    async ({ params }) => {
      const userId = params.id;

      if (!userId) return [];

      const context = await auth.$context;
      const organizationPlugin =
        context.getPlugin?.("organization") ??
        (auth.options.plugins?.find(
          (plugin) => (plugin as { id?: string }).id === "organization",
        ) as { id?: string; options?: Parameters<typeof getOrgAdapter>[1] } | undefined) ??
        null;

      if (!organizationPlugin) return [];

      const orgAdapter = getOrgAdapter(
        context,
        (organizationPlugin as {
          options?: Parameters<typeof getOrgAdapter>[1];
        }).options,
      );

      const organizations = await orgAdapter.listOrganizations(userId);

      if (!organizations.length) return [];

      const memberships = await Promise.all(
        organizations.map((organization) =>
          orgAdapter.checkMembership({
            userId,
            organizationId: organization.id,
          }),
        ),
      );

      return organizations.map((organization, index) => {
        let metadata = organization.metadata ?? null;
        if (typeof metadata === "string") {
          try {
            metadata = JSON.parse(metadata);
          } catch {
            metadata = null;
          }
        }

        const membership = memberships[index];

        return {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo ?? null,
          metadata,
          createdAt: organization.createdAt,
          updatedAt: (organization as { updatedAt?: unknown }).updatedAt,
          currentRole: membership?.role,
        };
      });
    },
    {
      detail: {
        summary: "List user organizations",
        tags: ["User"],
      },
      response: {
        200: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            slug: z.string(),
            logo: z.string().nullable().optional(),
            metadata: z.any().nullable().optional(),
            createdAt: z.any().optional(),
            updatedAt: z.any().optional(),
            currentRole: z.string().optional(),
            members: z
              .array(
                z.object({
                  id: z.string(),
                  userId: z.string(),
                  role: z.string().optional(),
                  createdAt: z.any().optional(),
                  user: z
                    .object({
                      id: z.string().optional(),
                      name: z.string().optional(),
                      image: z.string().nullable().optional(),
                      username: z.string().optional(),
                    })
                    .optional(),
                }),
              )
              .optional(),
          }),
        ),
      },
    },
  );
