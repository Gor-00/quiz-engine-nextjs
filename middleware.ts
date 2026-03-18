import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // Request is already authorized by callbacks below.
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname === "/admin/login") {
          return true;
        }
        return token?.role === "admin";
      }
    },
    pages: {
      signIn: "/admin/login"
    }
  }
);

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
