import { connectToDatabase } from "./connection";
import { User } from "./models/User";

export async function upsertUserByEmail(
  input: UpsertUserInput
): Promise<ILeanUser | null> {
  const { email } = input;
  if (!email) throw new Error("email é obrigatório para upsertUserByEmail");

  // eslint-disable-next-line no-console
  console.log("[upsertUserByEmail] start");

  await connectToDatabase();

  const update = {
    _id: email,
    name: input.name ?? null,
    image: input.image ?? null,
    provider: input.provider ?? null,
    // Prioriza discordId, aceita providerAccountId como fallback (migração)
    discordId: input.discordId ?? input.providerAccountId ?? null,
  };

  try {
    const doc = await User.findByIdAndUpdate(
      email,
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
      .lean()
      .exec();

    // eslint-disable-next-line no-console
    console.log("[upsertUserByEmail] ok");
    return (doc as unknown) as ILeanUser | null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[upsertUserByEmail] erro", err);
    throw err;
  }
}

export async function getUserByEmail(email: string): Promise<ILeanUser | null> {
  if (!email) throw new Error("email é obrigatório para getUserByEmail");
  await connectToDatabase();
  try {
    const doc = await User.findById(email).lean().exec();
    // eslint-disable-next-line no-console
    console.log("[getUserByEmail] encontrado:");
    return (doc as unknown) as ILeanUser | null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[getUserByEmail] erro", err);
    throw err;
  }
}

export async function getUserByName(name: string): Promise<ILeanUser | null> {
  if (!name) throw new Error("name é obrigatório para getUserByName");
  await connectToDatabase();

  try {
    const doc = await User.findOne({ name }).lean().exec();
    console.log("[getUserByName] encontrado:", doc?.name || "nenhum");

    return doc as unknown as ILeanUser | null;
  } catch (err) {
    console.error("[getUserByName] erro", err);
    throw err;
  }
}