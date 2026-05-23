"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { ArrowRight, Mail, UserRound } from "lucide-react";
import { auth } from "@/lib/firebase";
import { createUserProfile } from "@/lib/users";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/map";
  const isSignup = mode === "signup";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isSignup) {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );
        const cleanName = displayName.trim() || email.split("@")[0];

        await updateProfile(credential.user, { displayName: cleanName });
        await createUserProfile(credential.user, cleanName);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }

      router.replace(next);
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message.replace("Firebase: ", "")
          : "Authentication failed.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-lg border border-white/60 bg-white/90 p-6 shadow-soft backdrop-blur">
      <div className="mb-7">
        <Link
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-clay"
          href="/"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-clay text-white">
            <Mail className="h-4 w-4" />
          </span>
          APOO
        </Link>
        <h1 className="text-2xl font-semibold tracking-normal text-ink">
          {isSignup ? "Create your place" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink/65">
          {isSignup
            ? "Save the places that hold your stories."
            : "Return to the map where your memories live."}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {isSignup ? (
          <Input
            autoComplete="name"
            label="Display name"
            name="displayName"
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Maya"
            value={displayName}
          />
        ) : null}

        <Input
          autoComplete="email"
          label="Email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />

        <Input
          autoComplete={isSignup ? "new-password" : "current-password"}
          helper={isSignup ? "Use at least 6 characters." : undefined}
          label="Password"
          minLength={6}
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="********"
          required
          type="password"
          value={password}
        />

        {error ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}

        <Button
          className="w-full"
          disabled={submitting}
          icon={isSignup ? <UserRound className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          type="submit"
        >
          {submitting ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        {isSignup ? "Already have an account?" : "New to APOO?"}{" "}
        <Link
          className="font-semibold text-clay hover:text-clay/80"
          href={isSignup ? "/login" : "/signup"}
        >
          {isSignup ? "Log in" : "Create one"}
        </Link>
      </p>
    </div>
  );
}
