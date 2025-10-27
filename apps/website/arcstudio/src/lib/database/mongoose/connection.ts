import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI não definida. Adicione MONGODB_URI no .env (ex: mongodb+srv://user:pass@cluster/db)"
  );
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Extensão global para cache do Mongoose
declare global {
  var _mongoose: MongooseCache | undefined;
}

// Garantindo que global._mongoose exista
const globalCache: MongooseCache = global._mongoose ?? { conn: null, promise: null };
if (!global._mongoose) global._mongoose = globalCache;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (global._mongoose!.conn) {
    console.log("[mongo] usando conexão cacheada");
    return global._mongoose!.conn;
  }

  if (!global._mongoose!.promise) {
    console.log("[mongo] criando nova conexão ->");
    global._mongoose!.promise = mongoose
      .connect(MONGODB_URI!, { dbName: "arcstudio" })
      .then((m) => {
        console.log("[mongo] conectado:", m.connection.name);
        return m;
      })
      .catch((err) => {
        console.error("[mongo] erro ao conectar:", err);
        global._mongoose!.promise = null;
        throw err;
      });
  }

  global._mongoose!.conn = await global._mongoose!.promise;
  return global._mongoose!.conn;
}