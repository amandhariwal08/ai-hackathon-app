import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Fetch all users from your backend
        const res = await fetch("https://schema-sync.onrender.com/user", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) return null;

        const users = await res.json();

        // Find user with matching email and password
        const user = users.users.find(
          (u: any) =>
            u.user_email === credentials?.email &&
            u.user_password === credentials?.password
        );

        if (user) {
          // Return user object to set in session
          return {
            id: user.user_uuid,
            email: user.user_email,
            firstname: user.user_firstname,
            lastname: user.user_lastname,
          };
        } else {
          // No match found
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt", // or "database" if you want to persist sessions in DB
  },
  callbacks: {
    async jwt({ token, user }) {
      // Attach user data to the token (on login)
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      // Attach user data to the session (on every request)
      if (token.user) {
        session.user = token.user;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Optional: custom login page
  },
});

export { handler as GET, handler as POST };
