// next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string | null;
      email?: string | null;
      firstname?: string | null;
      lastname?: string | null;
    };
  }
}
