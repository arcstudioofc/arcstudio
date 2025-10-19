// src/lib/auth/index.ts
import { NextAuthOptions } from "next-auth";
import Discord from "next-auth/providers/discord";

import { upsertUserByEmail } from "@/lib/database/mongoose/service";

/**
 * NextAuth options com upsert no evento signIn.
 * Salva discordId (campo camelCase) no banco; aceita providerAccountId/id como fallback.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify email" } }, // garante email e id
    }),
  ],

  callbacks: {
    // Callback JWT: garante que o token tenha id e picture
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      if (user?.image) token.picture = user.image;
      return token;
    },

    // Callback Session: garante que session.user.id e image existam
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.image = token.picture!;
      }
      return session;
    },
  },

  events: {
    /**
     * Sempre que ocorrer um signIn (OAuth), damos um upsert no Mongo usando
     * o email como _id. Isso garante que dados do login fiquem persistidos.
     */
    async signIn({ user, account }) {
      try {
        // Log para debug (remova em produção se quiser)
        // eslint-disable-next-line no-console
        console.log("[next-auth] signIn event");

        // user.email vem porque pedimos scope email
        if (!user?.email) {
          // eslint-disable-next-line no-console
          console.warn("[next-auth] signIn sem email — não upsertando");
          return;
        }

        // Normaliza para discordId (prioriza providerAccountId por compatibilidade)
        let discordId: string | null = null;
        if (account) {
          // next-auth Account typing may differ entre versões; normalizamos em runtime
          if (typeof (account as any).providerAccountId === "string") {
            discordId = (account as any).providerAccountId;
          } else if (typeof (account as any).id === "string") {
            // algumas versões/fluxos colocam o id em account.id
            discordId = (account as any).id;
          } else {
            discordId = null;
          }
        }

        const provider = typeof account?.provider === "string" ? account.provider : null;

        await upsertUserByEmail({
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
          provider,
          discordId, // usamos discordId agora
        });
      } catch (err) {
        // não quebrar o fluxo de login — apenas logar o erro
        // eslint-disable-next-line no-console
        console.error("Erro ao salvar usuário no MongoDB:", err);
      }
    },
  },

  // URL customizada para login (opcional)
  // pages: { signIn: "/auth/login" },

  secret: process.env.NEXTAUTH_SECRET,
};
