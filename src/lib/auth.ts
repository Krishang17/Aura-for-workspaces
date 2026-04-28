import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

// Microsoft Entra ID (Azure AD) provider
const MicrosoftProvider = {
  id: "microsoft",
  name: "Microsoft",
  type: "oauth" as const,
  wellKnown:
    "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
  authorization: {
    params: {
      scope: "openid profile email offline_access User.Read Mail.Read Calendars.Read",
      prompt: "consent",
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

async function refreshGoogleToken(token: JWT): Promise<JWT> {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return {
      ...token,
      accessToken: data.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + (data.expires_in as number),
      refreshToken: data.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing Google token:", error);
    return { ...token, error: "RefreshTokenError" };
  }
}

async function refreshMicrosoftToken(token: JWT): Promise<JWT> {
  try {
    const res = await fetch(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID!,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
          grant_type: "refresh_token",
          refresh_token: token.refreshToken as string,
          scope: "openid profile email offline_access User.Read Mail.Read Calendars.Read",
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw data;
    return {
      ...token,
      accessToken: data.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + (data.expires_in as number),
      refreshToken: data.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing Microsoft token:", error);
    return { ...token, error: "RefreshTokenError" };
  }
}

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
  ],

  callbacks: {
    async jwt({ token, account }) {
      // First sign-in: persist OAuth tokens
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          provider: account.provider,
          expiresAt: account.expires_at,
        };
      }

      // Token hasn't expired yet — return as-is (with 60s buffer)
      if (token.expiresAt && Date.now() / 1000 < token.expiresAt - 60) {
        return token;
      }

      // Token expired — refresh based on provider
      if (token.refreshToken) {
        if (token.provider === "google") return refreshGoogleToken(token);
        if (token.provider === "microsoft") return refreshMicrosoftToken(token);
      }

      return token;
    },

    async session({ session, token }) {
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
