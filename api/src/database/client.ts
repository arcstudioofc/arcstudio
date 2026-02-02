import { MongoClient } from "mongodb";

import { env } from "../config/env.js";

export const client = new MongoClient(env.MONGODB_URI);
export const db = client.db(env.MONGODB_DB_NAME);