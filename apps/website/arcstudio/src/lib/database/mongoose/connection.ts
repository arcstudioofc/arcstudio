import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI não definida. Adicione MONGODB_URI no .env (ex: mongodb+srv://user:pass@cluster/db)"
  );
}

type Cache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: Cache | undefined;
}

const globalAny = global as any;

if (!globalAny._mongoose) {
  globalAny._mongoose = { conn: null, promise: null } as Cache;
}

export async function connectToDatabase() {
  if (globalAny._mongoose.conn) {
    // conexão já existe
    // eslint-disable-next-line no-console
    console.log("[mongo] usando conexão cacheada");
    return globalAny._mongoose.conn;
  }

  if (!globalAny._mongoose.promise) {
    // eslint-disable-next-line no-console
    console.log("[mongo] criando nova conexão ->", maskUri(MONGODB_URI));
    globalAny._mongoose.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "arcstudio", // nome do banco de dados
      })
      .then((m) => {
        // eslint-disable-next-line no-console
        console.log("[mongo] conectado:", m.connection.name);
        return m;
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("[mongo] erro ao conectar:", err);
        globalAny._mongoose.promise = null;
        throw err;
      });
  }

  globalAny._mongoose.conn = await globalAny._mongoose.promise;
  return globalAny._mongoose.conn;
}

/** util helper: máscara credenciais da URI para logs (não exponha tudo) */
function maskUri(uri: string) {
  try {
    const url = new URL(uri.replace("mongodb+srv://", "https://"));
    if (url.username) {
      return uri.replace(url.username, "***").replace(url.password, "***");
    }
    return uri;
  } catch {
    return "***";
  }
}
