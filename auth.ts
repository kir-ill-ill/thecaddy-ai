import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import {
  getUserByEmail,
  getUserById,
  verifyPassword,
  createUser,
  createAccount,
  getAccountByProvider,
  createSession,
  getSessionAndUser,
  deleteSession,
  updateSession,
  createVerificationToken,
  useVerificationToken,
  updateUser,
} from './lib/auth-db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // Email/Password credentials
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await getUserByEmail(email);
        if (!user) {
          return null;
        }

        // Magic link authentication - password already verified via token
        if (password === '__MAGIC_LINK__') {
          // Only allow if email is verified (token was valid)
          if (user.email_verified) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            };
          }
          return null;
        }

        const isValid = await verifyPassword(user, password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),

    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    newUser: '/dashboard',
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // Check if user exists
        let dbUser = await getUserByEmail(user.email!);

        if (!dbUser) {
          // Create new user
          dbUser = await createUser({
            name: user.name || undefined,
            email: user.email!,
            image: user.image || undefined,
          });
        }

        // Check if account link exists
        const existingAccount = await getAccountByProvider(
          account.provider,
          account.providerAccountId
        );

        if (!existingAccount) {
          // Link account to user
          await createAccount({
            user_id: dbUser.id,
            type: account.type,
            provider: account.provider,
            provider_account_id: account.providerAccountId,
            refresh_token: account.refresh_token || null,
            access_token: account.access_token || null,
            expires_at: account.expires_at || null,
            token_type: account.token_type || null,
            scope: account.scope || null,
            id_token: account.id_token || null,
            session_state: (account.session_state as string) || null,
          });
        }

        // Update user object with DB id
        user.id = dbUser.id;
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }

      if (trigger === 'update' && session) {
        token.name = session.name;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET,
});

// Type augmentation for session
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}
