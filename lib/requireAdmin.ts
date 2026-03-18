import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.role)) {
    return null;
  }
  return session;
}
