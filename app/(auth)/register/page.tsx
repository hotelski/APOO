import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <main className="apoo-ambient flex min-h-screen items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-sm text-ivory/60">Loading...</div>}>
        <AuthForm mode="register" />
      </Suspense>
    </main>
  );
}
