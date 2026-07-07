import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/get-admin-session";
import { AdminDashboard } from "@/components/admin-dashboard";

export default async function AdminPage() {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <AdminDashboard />
  );
}