import { cookies } from "next/headers";

export async function logoutAdmin() {
  const cookieStore = await cookies();

  cookieStore.delete("admin-session");
}