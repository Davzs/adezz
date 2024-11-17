import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    thumbnailImage?: string;
  }

  interface Session {
    user: User & {
      id: string;
      thumbnailImage?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    thumbnailImage?: string;
  }
}
