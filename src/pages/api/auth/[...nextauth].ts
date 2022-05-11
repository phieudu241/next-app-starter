import NextAuth from "next-auth";
import Providers from "next-auth/providers";

import { getUserByEmail, verifyPassword, getRoleNamesByUserId } from "utils/auth";
import { ERROR_MESSAGES } from "constants/errors";
import { signInSchema } from "libs/validation/schemas";

export default NextAuth({
  providers: [
    Providers.Credentials({
      async authorize(credentials: any) {
        signInSchema.validateSync(credentials);
        const { email, password } = credentials;
        const user = await getUserByEmail(email);
        if (!user) {
          throw new Error(ERROR_MESSAGES.INVALID_CREDENTIAL);
        }
        if (!await verifyPassword(password, user.password)) throw new Error(ERROR_MESSAGES.INVALID_CREDENTIAL);
        return { email: user.email, name: user.name, roles: await getRoleNamesByUserId(user.id) };
      }
    })
  ],
  database: process.env.DATABASE_URL,
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  session: {
    jwt: true,
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async jwt(token, user) {
      if (user) {
        token.roles = user.roles;
      }
      return token;
    },
    async session(session, token) {
      if (token?.roles) {
        session.user.roles = token.roles;
      }
      return session;
    }
  }
});
