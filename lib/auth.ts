import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";
import bcryptjs from "bcryptjs";

// Development mode flag - set to false in production
const DEVELOPMENT_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@hyperbox.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // In development mode, allow any credentials
        if (DEVELOPMENT_MODE) {
          return {
            id: "dev-user-1",
            email: credentials?.email || "demo@hyperbox.com",
            name: "مستخدم التطوير",
            role: "admin",
          };
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("User not found");
        }

        const passwordMatch = await bcryptjs.compare(
          credentials.password,
          user.password || ""
        );

        if (!passwordMatch) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
