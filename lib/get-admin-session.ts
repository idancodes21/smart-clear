import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function getAdminSession() {
  const cookieStore = await cookies();

  const session = cookieStore.get("admin-session");

  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: {
      id: session.value,
    },
  });

  if (!user) return null;

  if (user.role !== "OFFICER") return null;

  return user;
}