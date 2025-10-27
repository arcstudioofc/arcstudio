import { NextAuthOptions, Account } from "next-auth";
import Discord from "next-auth/providers/discord";
import { upsertUserByEmail } from "@/lib/database/mongoose/service";

export const authOptions: NextAuthOptions = {
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify email" } },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      if (user?.image) token.picture = user.image;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.image = token.picture!;
      }
      return session;
    },
  },

  events: {
    async signIn({ user, account }) {
      try {
        if (!user?.email) return;

        const discordId = getDiscordId(account);
        const provider = account?.provider ?? null;

        await upsertUserByEmail({
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
          provider,
          discordId,
        });
      } catch (err) {
        console.error("Erro ao salvar usuário no MongoDB:", err);
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// Função utilitária para extrair discordId sem any
function getDiscordId(account?: Account | null): string | null {
  if (!account) return null;
  if (typeof account.providerAccountId === "string") return account.providerAccountId;
  if (typeof account.id === "string") return account.id;
  return null;
}
