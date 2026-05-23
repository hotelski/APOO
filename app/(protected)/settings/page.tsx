"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Save } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateUserDisplayName, userDisplayName } from "@/lib/users";

export default function SettingsPage() {
  const { user, profile, logout, refreshProfile } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(
    profile?.displayName || userDisplayName(user),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await updateUserDisplayName(user, displayName);
      await refreshProfile();
      setMessage("Settings saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 text-ivory sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-ivory/40">
          Settings
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-[0.08em] text-ivory">
          Account basics
        </h1>
      </div>

      <section className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-nocturne backdrop-blur">
        <form className="space-y-5" onSubmit={handleSave}>
          <Input
            label="Display name"
            name="displayName"
            onChange={(event) => setDisplayName(event.target.value)}
            required
            value={displayName}
          />

          <Input
            disabled
            label="Email"
            name="email"
            value={user?.email ?? ""}
          />

          {message ? (
            <p className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-ivory/70">{message}</p>
          ) : null}
          {error ? (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              icon={<Save className="h-4 w-4" />}
              disabled={saving}
              type="submit"
            >
              {saving ? "Saving..." : "Save settings"}
            </Button>
            <Button
              icon={<LogOut className="h-4 w-4" />}
              onClick={handleSignOut}
              type="button"
              variant="secondary"
            >
              Sign out
            </Button>
          </div>
        </form>
      </section>

      <section className="mt-5 rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-ivory">Privacy defaults</h2>
        <p className="mt-2 text-sm leading-6 text-ivory/55">
          New memories start as private. You can mark individual memories public
          when you want them to appear for other APOO members.
        </p>
      </section>
    </main>
  );
}
