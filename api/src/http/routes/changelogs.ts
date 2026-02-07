import { Elysia } from "elysia";
import crypto from "node:crypto";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { z } from "zod";
import { ObjectId } from "mongodb";

import { auth } from "../../config/auth.js";
import { db } from "../../database/client.js";

type ChangelogDoc = {
  title: string;
  content: string;
  type: string;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

const collection = db.collection<ChangelogDoc>("changelogs");

const serializeChangelog = (doc: ChangelogDoc & { _id: ObjectId }) => ({
  ...doc,
  _id: doc._id.toString(),
  date: doc.date instanceof Date ? doc.date.toISOString() : doc.date,
  createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
  updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
});

type StatusSetter = { status?: number | string };

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const UPLOAD_DIR = path.resolve(process.cwd(), "..", "web", "public", "changelogs");
const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg"]);

const sanitizeBaseName = (name?: string) => {
  const base = path.basename(name ?? "image", path.extname(name ?? ""));
  const safe = base
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return safe.slice(0, 60) || "image";
};

const resolveExtension = (mime?: string, name?: string) => {
  const fromMime = mime ? ALLOWED_MIME_TO_EXT[mime] : undefined;
  if (fromMime) return fromMime;
  const ext = path.extname(name ?? "").replace(".", "").toLowerCase();
  if (!ext) return null;
  if (ext === "jpeg") return "jpg";
  if (!ALLOWED_EXT.has(ext)) return null;
  return ext;
};

const parseBase64Payload = (body: unknown) => {
  if (!body || typeof body !== "object") return null;
  const payload = body as { name?: string; type?: string; data?: string };
  if (!payload.data || !payload.type) return null;
  return payload as { name?: string; type: string; data: string };
};

const stripDataUrl = (data: string) => {
  if (data.startsWith("data:")) {
    const commaIndex = data.indexOf(",");
    if (commaIndex >= 0) return data.slice(commaIndex + 1);
  }
  return data;
};

const requireAdmin = async (headers: Record<string, string | undefined>, set: StatusSetter) => {
  const session = await auth.api.getSession({ headers });
  if (!session) {
    set.status = 401;
    throw new Error("Não autenticado");
  }
  if (session.user.role !== "admin") {
    set.status = 403;
    throw new Error("Acesso restrito para administradores");
  }
};

export const changelogRoutes = new Elysia({ prefix: "/changelogs" })
  .post(
    "/upload",
    async ({ body, headers, set }) => {
      await requireAdmin(headers, set);

      const payload = parseBase64Payload(body);
      if (!payload) {
        set.status = 400;
        return { error: "Envie uma imagem válida." };
      }

      const type = payload.type ?? "";
      if (!type.startsWith("image/")) {
        set.status = 415;
        return { error: "Tipo de arquivo não suportado." };
      }

      const ext = resolveExtension(type, payload.name);
      if (!ext) {
        set.status = 415;
        return { error: "Extensão de imagem não suportada." };
      }

      let buffer: Buffer;
      try {
        const base64 = stripDataUrl(payload.data);
        buffer = Buffer.from(base64, "base64");
      } catch {
        set.status = 400;
        return { error: "Imagem inválida." };
      }

      if (!buffer || buffer.length === 0) {
        set.status = 400;
        return { error: "Imagem inválida." };
      }

      if (buffer.length > MAX_UPLOAD_BYTES) {
        set.status = 413;
        return { error: "O limite é 10MB por imagem." };
      }

      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const token = crypto.randomBytes(6).toString("hex");
      const baseName = sanitizeBaseName(payload.name);
      const filename = `${stamp}-${token}-${baseName}.${ext}`;

      await mkdir(UPLOAD_DIR, { recursive: true });
      await writeFile(path.join(UPLOAD_DIR, filename), buffer);

      set.status = 201;
      return { success: true, url: `/changelogs/${filename}` };
    },
    {
      body: z.object({
        data: z.string().min(1),
        type: z.string().min(1),
        name: z.string().optional(),
      }),
      detail: {
        summary: "Upload changelog image",
        tags: ["Changelog"],
      },
      response: {
        201: z.object({
          success: z.literal(true),
          url: z.string(),
        }),
        400: z.object({ error: z.string() }),
        401: z.object({ error: z.string() }),
        403: z.object({ error: z.string() }),
        413: z.object({ error: z.string() }),
        415: z.object({ error: z.string() }),
      },
    },
  )
  .get(
    "/",
    async () => {
      const docs = await collection.find().sort({ date: -1 }).toArray();
      return docs.map((doc) => serializeChangelog(doc as ChangelogDoc & { _id: ObjectId }));
    },
    {
      detail: {
        summary: "List changelogs",
        tags: ["Changelog"],
      },
      response: {
        200: z.array(
          z.object({
            _id: z.string(),
            title: z.string(),
            content: z.string(),
            type: z.string(),
            date: z.string(),
            createdAt: z.string().optional(),
            updatedAt: z.string().optional(),
          }),
        ),
      },
    },
  )
  .get(
    "/recent",
    async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const recent = await collection.findOne({ date: { $gte: threeDaysAgo } });
      return { hasRecent: !!recent };
    },
    {
      detail: {
        summary: "Check recent changelogs",
        tags: ["Changelog"],
      },
      response: {
        200: z.object({ hasRecent: z.boolean() }),
      },
    },
  )
  .post(
    "/",
    async ({ body, headers, set }) => {
      await requireAdmin(headers, set);

      const now = new Date();
      const doc: ChangelogDoc = {
        title: body.title,
        content: body.content,
        type: body.type,
        date: now,
        createdAt: now,
        updatedAt: now,
      };

      const result = await collection.insertOne(doc);
      set.status = 201;
      return {
        success: true,
        data: serializeChangelog({ ...doc, _id: result.insertedId }),
      };
    },
    {
      body: z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        type: z.string().min(1),
      }),
      detail: {
        summary: "Create changelog",
        tags: ["Changelog"],
      },
      response: {
        201: z.object({
          success: z.literal(true),
          data: z.object({
            _id: z.string(),
            title: z.string(),
            content: z.string(),
            type: z.string(),
            date: z.string(),
            createdAt: z.string().optional(),
            updatedAt: z.string().optional(),
          }),
        }),
        403: z.object({ error: z.string() }),
      },
    },
  )
  .put(
    "/",
    async ({ body, headers, set }) => {
      await requireAdmin(headers, set);

      if (!ObjectId.isValid(body.id)) {
        set.status = 400;
        return { error: "ID inválido" };
      }

      const update = {
        title: body.title,
        content: body.content,
        type: body.type,
        updatedAt: new Date(),
      };

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(body.id) },
        { $set: update },
        { returnDocument: "after" },
      );

      if (!result) {
        set.status = 404;
        return { error: "Changelog não encontrado" };
      }

      return {
        success: true,
        data: serializeChangelog(result as ChangelogDoc & { _id: ObjectId }),
      };
    },
    {
      body: z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        content: z.string().min(1),
        type: z.string().min(1),
      }),
      detail: {
        summary: "Update changelog",
        tags: ["Changelog"],
      },
      response: {
        200: z.object({
          success: z.literal(true),
          data: z.object({
            _id: z.string(),
            title: z.string(),
            content: z.string(),
            type: z.string(),
            date: z.string(),
            createdAt: z.string().optional(),
            updatedAt: z.string().optional(),
          }),
        }),
        400: z.object({ error: z.string() }),
        403: z.object({ error: z.string() }),
        404: z.object({ error: z.string() }),
      },
    },
  )
  .delete(
    "/",
    async ({ query, headers, set }) => {
      await requireAdmin(headers, set);

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
        summary: "Delete changelog",
        tags: ["Changelog"],
      },
      response: {
        200: z.object({ success: z.literal(true) }),
        400: z.object({ error: z.string() }),
        403: z.object({ error: z.string() }),
      },
    },
  );
