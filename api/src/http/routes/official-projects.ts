import { Elysia } from "elysia";
import { z } from "zod";
import { ObjectId } from "mongodb";

import { auth } from "../../config/auth.js";
import { db } from "../../database/client.js";

type OfficialProjectDoc = {
  key: string;
  name: string;
  authors: string[];
  infos: {
    images: { banner: string };
    links: { url: string; label?: string }[];
  };
  createdAt?: Date;
  updatedAt?: Date;
};

const collection = db.collection<OfficialProjectDoc>("officialprojects");

const serializeProject = (doc: OfficialProjectDoc & { _id: ObjectId }) => ({
  ...doc,
  infos: {
    ...doc.infos,
    links: normalizeLinks((doc as OfficialProjectDoc).infos?.links),
  },
  _id: doc._id.toString(),
  createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
  updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
});

type StatusSetter = { status?: number | string };

const requireAdmin = async (headers: Record<string, string | undefined>, set: StatusSetter) => {
  const session = await auth.api.getSession({ headers });
  if (!session) {
    set.status = 401;
    return { error: "Não autenticado" };
  }
  if (session.user.role !== "admin") {
    set.status = 403;
    return { error: "Acesso restrito para administradores" };
  }
};

type LinksInput =
  | { url: string; label?: string | undefined }[]
  | { website?: string | undefined; github?: string | undefined }
  | undefined
  | null;

const normalizeLinks = (links: LinksInput) => {
  if (!links) return [];
  if (Array.isArray(links)) {
    return links
      .map((link) => ({
        url: String(link.url ?? "").trim(),
        ...(link.label ? { label: String(link.label).trim() } : {}),
      }))
      .filter((link) => link.url)
      .slice(0, 4);
  }
  const result: { url: string }[] = [];
  if (links.website) result.push({ url: links.website });
  if (links.github) result.push({ url: links.github });
  return result;
};

const linkSchema = z.object({
  url: z.string().min(1),
  label: z.string().optional(),
});

const projectSchema = z.object({
  _id: z.string().optional(),
  key: z.string().min(1),
  name: z.string().min(1),
  authors: z.array(z.string().min(1)),
  infos: z.object({
    images: z.object({
      banner: z.string().min(1),
    }),
    links: z
      .union([
        z.array(linkSchema).max(4),
        z.object({
          website: z.string().optional(),
          github: z.string().optional(),
        }),
      ])
      .optional(),
  }),
});

export const officialProjectRoutes = new Elysia({ prefix: "/official-projects" })
  .get(
    "/",
    async () => {
      const docs = await collection.find().sort({ createdAt: -1 }).toArray();
      return docs.map((doc) => serializeProject(doc as OfficialProjectDoc & { _id: ObjectId }));
    },
    {
      detail: {
        summary: "List official projects",
        tags: ["Official Projects"],
      },
      response: {
        200: z.array(
          z.object({
            _id: z.string(),
            key: z.string(),
            name: z.string(),
            authors: z.array(z.string()),
            infos: z.object({
              images: z.object({
                banner: z.string(),
              }),
              links: z.array(linkSchema),
            }),
            createdAt: z.string().optional(),
            updatedAt: z.string().optional(),
          }),
        ),
      },
    },
  )
  .post(
    "/",
    async ({ body, headers, set }) => {
      const error = await requireAdmin(headers, set);
      if (error) return error;

      const links = normalizeLinks(body.infos.links);
      const now = new Date();
      const doc: OfficialProjectDoc = {
        key: body.key,
        name: body.name,
        authors: body.authors,
        infos: {
          images: { banner: body.infos.images.banner },
          links,
        },
        createdAt: now,
        updatedAt: now,
      };

      const result = await collection.insertOne(doc);
      set.status = 201;
      return {
        success: true,
        project: serializeProject({ ...doc, _id: result.insertedId }),
      };
    },
    {
      body: projectSchema.omit({ _id: true }),
      detail: {
        summary: "Create official project",
        tags: ["Official Projects"],
      },
      response: {
        201: z.object({
          success: z.literal(true),
          project: z.object({
            _id: z.string(),
            key: z.string(),
            name: z.string(),
            authors: z.array(z.string()),
            infos: z.object({
              images: z.object({
                banner: z.string(),
              }),
              links: z.array(linkSchema),
            }),
            createdAt: z.string().optional(),
            updatedAt: z.string().optional(),
          }),
        }),
        401: z.object({ error: z.string() }),
        403: z.object({ error: z.string() }),
      },
    },
  )
  .put(
    "/",
    async ({ body, headers, set }) => {
      const error = await requireAdmin(headers, set);
      if (error) return error;

      if (!body._id || !ObjectId.isValid(body._id)) {
        set.status = 400;
        return { error: "ID inválido" };
      }

      const links = normalizeLinks(body.infos.links);
      const update = {
        key: body.key,
        name: body.name,
        authors: body.authors,
        infos: {
          images: { banner: body.infos.images.banner },
          links,
        },
        updatedAt: new Date(),
      };

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(body._id) },
        { $set: update },
        { returnDocument: "after" },
      );

      if (!result) {
        set.status = 404;
        return { error: "Projeto não encontrado" };
      }

      return {
        success: true,
        project: serializeProject(result as OfficialProjectDoc & { _id: ObjectId }),
      };
    },
    {
      body: projectSchema,
      detail: {
        summary: "Update official project",
        tags: ["Official Projects"],
      },
      response: {
        200: z.object({
          success: z.literal(true),
          project: z.object({
            _id: z.string(),
            key: z.string(),
            name: z.string(),
            authors: z.array(z.string()),
            infos: z.object({
              images: z.object({
                banner: z.string(),
              }),
              links: z.array(linkSchema),
            }),
            createdAt: z.string().optional(),
            updatedAt: z.string().optional(),
          }),
        }),
        400: z.object({ error: z.string() }),
        401: z.object({ error: z.string() }),
        403: z.object({ error: z.string() }),
        404: z.object({ error: z.string() }),
      },
    },
  )
  .delete(
    "/",
    async ({ query, headers, set }) => {
      const error = await requireAdmin(headers, set);
      if (error) return error;

      if (!ObjectId.isValid(query.id)) {
        set.status = 400;
        return { error: "ID inválido" };
      }

      await collection.deleteOne({ _id: new ObjectId(query.id) });
      return { success: true };
    },
    {
      query: z.object({ id: z.string().min(1) }),
      detail: {
        summary: "Delete official project",
        tags: ["Official Projects"],
      },
      response: {
        200: z.object({ success: z.literal(true) }),
        400: z.object({ error: z.string() }),
        403: z.object({ error: z.string() }),
      },
    },
  );
