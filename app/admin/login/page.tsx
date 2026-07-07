import { ShieldCheck } from "lucide-react";
import { AdminLoginForm } from "@/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-3xl font-bold">
            SmartClear
          </h1>

          <p className="text-muted-foreground mt-2">
            Administrative Portal
          </p>

          <p className="text-sm text-muted-foreground mt-1">
            Secure access for authorized personnel only.
          </p>
        </div>

        <AdminLoginForm />

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 SmartClear
        </p>

      </div>
    </main>
  );
}