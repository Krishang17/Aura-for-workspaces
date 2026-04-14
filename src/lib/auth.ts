import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import SlackProvider from "next-auth/providers/slack";

// Microsoft Entra ID (Azure AD) provider — configured manually
// because the built-in AzureADProvider was removed in newer versions.
const MicrosoftProvider = {
  id: "microsoft",
  name: "Microsoft",
  type: "oauth" as const,
  wellKnown:
    "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
  authorization: {
    params: {
      scope: "openid profile email User.Read Mail.Read Calendars.Read",
    },
  },
  clientId: process.env.MICROSOFT_CLIENT_ID!,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
  profile(profile: Record<string, string>) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: null,
    };
  },
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    MicrosoftProvider,
    SlackProvider({
      clientId: process.env.SLACK_CLIENT_ID!,
      clientSecret: process.env.SLACK_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token and provider to the JWT on first sign-in
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
        token.expiresAt = account.expires_at;
      }
      return token;
    },

    async session({ session, token }) {
      // Expose provider & access token to client-side session
      session.user.id = token.sub!;
      session.provider = token.provider as string;
      session.accessToken = token.accessToken as string;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
