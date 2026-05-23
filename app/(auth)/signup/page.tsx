import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-sm text-ink/60">Loading...</div>}>
        <AuthForm mode="signup" />
      </Suspense>
    </main>
  );
}
