import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      // Set when admin is impersonating another user
      adminId?: string;
      adminEmail?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    email?: string;
    rememberMe?: boolean;
    expiresAt?: number;
    // Impersonation
    impersonatingId?: string;
    impersonatedEmail?: string;
    impersonatedRole?: string;
  }
}
