import { compare } from "bcrypt-ts";
import NextAuth, { type DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { DUMMY_PASSWORD } from "@/lib/constants";
import {
  createGuestUser,
  getUser,
  getOrCreateOAuthUser,
} from "@/lib/db/queries";
import { sendWelcomeEmail } from "@/lib/email/send-welcome-email";
import { authConfig } from "./auth.config";

export type UserType = "guest" | "regular";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession["user"];
  }

  // biome-ignore lint/nursery/useConsistentTypeDefinitions: "Required"
  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const users = await getUser(email);

        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [user] = users;

        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) {
          return null;
        }

        return { ...user, type: "regular" };
      },
    }),
    Credentials({
      id: "guest",
      credentials: {},
      async authorize() {
        const [guestUser] = await createGuestUser();
        return { ...guestUser, type: "guest" };
      },
    }),
  ],
  callbacks: {
    async signIn({ user: authUser, account: oauthAccount, profile }) {
      // For OAuth providers, look up or create the user in our DB
      if (
        oauthAccount &&
        (oauthAccount.provider === "google" ||
          oauthAccount.provider === "github")
      ) {
        const email = authUser.email ?? profile?.email;
        if (!email) return false;

        const providerAccountId =
          oauthAccount.providerAccountId ?? String(profile?.sub ?? profile?.id);

        try {
          const { user: dbUser, isNew } = await getOrCreateOAuthUser(
            email as string,
            oauthAccount.provider,
            providerAccountId,
            {
              accessToken: oauthAccount.access_token ?? undefined,
              refreshToken: oauthAccount.refresh_token ?? undefined,
              expiresAt: oauthAccount.expires_at ?? undefined,
              tokenType: oauthAccount.token_type ?? undefined,
              scope: oauthAccount.scope ?? undefined,
              idToken: oauthAccount.id_token ?? undefined,
            }
          );
          // Attach our DB user id and type to the authUser object for the jwt callback
          authUser.id = dbUser.id;
          authUser.type = "regular";
          // Fire welcome email for truly new users (don't block sign-in on failure)
          if (isNew && email) {
            sendWelcomeEmail(email as string).catch(() => {});
          }
        } catch {
          return false;
        }
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
      }

      return session;
    },
  },
});
