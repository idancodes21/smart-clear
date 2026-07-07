import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function createAdminSession(userId: string) {
  const cookieStore = await cookies();

  cookieStore.set("admin-session", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}