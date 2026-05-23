"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Flag,
  Lock,
  ShieldCheck,
  Trash2,
  UserCog,
  UsersRound,
} from "lucide-react";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  deleteMemoryAsAdmin,
  dismissReport,
  setUserRole,
  subscribeAdminMemories,
  subscribeAdminReports,
  subscribeAdminUsers,
} from "@/lib/admin";
import { cn } from "@/lib/cn";
import { formatTimestamp } from "@/lib/dates";
import { isAdminProfile } from "@/lib/users";
import type { Memory, Report, UserProfile, UserRole } from "@/types";

type AdminTab = "reports" | "memories" | "users";

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "reports", label: "Reports" },
  { id: "memories", label: "Memories" },
  { id: "users", label: "Users" },
];

function roleLabel(profile: UserProfile) {
  return isAdminProfile(profile) ? "admin" : "user";
}

function UserLine({ profile }: { profile: UserProfile | undefined }) {
  if (!profile) {
    return <span className="text-ivory/35">Unknown user</span>;
  }

  return (
    <span>
      <span className="font-semibold text-ivory">
        {profile.displayName || profile.email || profile.id}
      </span>
      <span className="block truncate text-xs text-ivory/45">
        {profile.email || profile.id}
      </span>
    </span>
  );
}

function MemoryPrivacyBadge({ memory }: { memory: Memory }) {
  const PrivacyIcon = memory.privacy === "public" ? Eye : Lock;

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs font-semibold capitalize text-ivory/60">
      <PrivacyIcon className="h-3.5 w-3.5" />
      {memory.privacy}
    </span>
  );
}

function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("reports");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let readyUsers = false;
    let readyMemories = false;
    let readyReports = false;

    const markReady = () => {
      if (readyUsers && readyMemories && readyReports) {
        setLoading(false);
      }
    };
    const handleSubscriptionError = (error: Error) => {
      setActionError(error.message);
      setLoading(false);
    };

    const unsubscribeUsers = subscribeAdminUsers((nextUsers) => {
      readyUsers = true;
      setUsers(nextUsers);
      markReady();
    }, handleSubscriptionError);
    const unsubscribeMemories = subscribeAdminMemories((nextMemories) => {
      readyMemories = true;
      setMemories(nextMemories);
      markReady();
    }, handleSubscriptionError);
    const unsubscribeReports = subscribeAdminReports((nextReports) => {
      readyReports = true;
      setReports(nextReports);
      markReady();
    }, handleSubscriptionError);

    return () => {
      unsubscribeUsers();
      unsubscribeMemories();
      unsubscribeReports();
    };
  }, []);

  const usersById = useMemo(
    () => new Map(users.map((profile) => [profile.id, profile])),
    [users],
  );
  const memoriesById = useMemo(
    () => new Map(memories.map((memory) => [memory.id, memory])),
    [memories],
  );
  const publicCount = memories.filter((memory) => memory.privacy === "public").length;
  const adminCount = users.filter((profile) => isAdminProfile(profile)).length;

  const runAction = async (key: string, action: () => Promise<void>) => {
    setBusyAction(key);
    setActionError("");

    try {
      await action();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Admin action failed.");
    } finally {
      setBusyAction("");
    }
  };

  const handleDeleteMemory = (memory: Memory, report?: Report) => {
    const confirmed = window.confirm("Delete this memory permanently?");

    if (!confirmed) {
      return;
    }

    void runAction(`delete-memory-${memory.id}`, async () => {
      await deleteMemoryAsAdmin(memory);

      if (report) {
        await dismissReport(report.id);
      }
    });
  };

  const handleDismissReport = (reportId: string) => {
    void runAction(`dismiss-report-${reportId}`, () => dismissReport(reportId));
  };

  const handleRoleChange = (profile: UserProfile, role: UserRole) => {
    if (profile.id === user?.uid && role !== "admin") {
      setActionError("You cannot remove your own admin access from this panel.");
      return;
    }

    void runAction(`role-${profile.id}`, () => setUserRole(profile.id, role));
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 text-ivory sm:px-6 lg:px-8">
        <section className="mb-6 rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-nocturne backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.34em] text-ivory/40">
                <ShieldCheck className="h-4 w-4" />
                Admin
              </p>
              <h1 className="mt-2 font-serif text-3xl font-semibold tracking-[0.08em] text-ivory">
                APOO control panel
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ivory/55">
                Review reports, remove unsafe memories, and manage admin access.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[34rem]">
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-3">
                <p className="text-2xl font-semibold text-ivory">{reports.length}</p>
                <p className="text-xs text-ivory/45">Reports</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-3">
                <p className="text-2xl font-semibold text-ivory">{memories.length}</p>
                <p className="text-xs text-ivory/45">Memories</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-3">
                <p className="text-2xl font-semibold text-ivory">{publicCount}</p>
                <p className="text-xs text-ivory/45">Public</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-3">
                <p className="text-2xl font-semibold text-ivory">{adminCount}</p>
                <p className="text-xs text-ivory/45">Admins</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.05] p-1">
            {tabs.map((tab) => (
              <button
                className={cn(
                  "min-h-10 rounded-md px-4 text-sm font-semibold text-ivory/55 transition",
                  activeTab === tab.id && "bg-ivory text-night shadow-sm",
                )}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/10 px-4 text-sm font-semibold text-ivory/65 transition hover:bg-white/[0.08] hover:text-ivory"
            href="/map"
          >
            Back to map
          </Link>
        </div>

        {actionError ? (
          <p className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {actionError}
          </p>
        ) : null}

        {loading ? (
          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-8 text-sm text-ivory/55 shadow-sm">
            Loading admin data...
          </div>
        ) : null}

        {!loading && activeTab === "reports" ? (
          <section className="space-y-4">
            {reports.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/20 bg-white/[0.04] p-8 text-center">
                <Flag className="mx-auto h-9 w-9 text-ivory/55" />
                <h2 className="mt-3 font-serif text-lg font-semibold text-ivory">
                  No reports
                </h2>
                <p className="mt-2 text-sm text-ivory/50">
                  Public memory reports will appear here.
                </p>
              </div>
            ) : (
              reports.map((report) => {
                const memory = memoriesById.get(report.memoryId);
                const reporter = usersById.get(report.reporterId);

                return (
                  <article
                    className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-nocturne backdrop-blur"
                    key={report.id}
                  >
                    <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
                      <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-semibold text-ivory/65">
                            <Flag className="h-3.5 w-3.5" />
                            Report
                          </span>
                          <span className="text-sm text-ivory/35">
                            {formatTimestamp(report.createdAt)}
                          </span>
                        </div>
                        <h2 className="font-serif text-xl font-semibold text-ivory">
                          {memory?.title || "Memory no longer exists"}
                        </h2>
                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-ivory/65">
                          {report.reason || "No reason provided."}
                        </p>
                        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                            <p className="mb-1 text-xs uppercase tracking-[0.2em] text-ivory/35">
                              Reporter
                            </p>
                            <UserLine profile={reporter} />
                          </div>
                          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                            <p className="mb-1 text-xs uppercase tracking-[0.2em] text-ivory/35">
                              Owner
                            </p>
                            <UserLine
                              profile={memory ? usersById.get(memory.userId) : undefined}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {memory ? (
                          <>
                            <Link
                              className="flex min-h-10 items-center justify-center rounded-lg bg-ivory px-4 text-sm font-bold text-night transition hover:bg-ivory/90"
                              href={`/memories/${memory.id}`}
                            >
                              View memory
                            </Link>
                            <button
                              className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={busyAction === `delete-memory-${memory.id}`}
                              onClick={() => handleDeleteMemory(memory, report)}
                              type="button"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete memory
                            </button>
                          </>
                        ) : null}
                        <button
                          className="flex min-h-10 w-full items-center justify-center rounded-lg border border-white/10 px-4 text-sm font-semibold text-ivory/65 transition hover:bg-white/[0.08] hover:text-ivory disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={busyAction === `dismiss-report-${report.id}`}
                          onClick={() => handleDismissReport(report.id)}
                          type="button"
                        >
                          Dismiss report
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        ) : null}

        {!loading && activeTab === "memories" ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {memories.map((memory) => (
              <article
                className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-nocturne backdrop-blur"
                key={memory.id}
              >
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="h-28 w-full overflow-hidden rounded-lg bg-white/[0.05] sm:w-40">
                    {memory.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt=""
                        className="h-full w-full object-cover"
                        src={memory.imageUrl}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-semibold text-ivory/35">
                        No photo
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <MemoryPrivacyBadge memory={memory} />
                      <span className="text-xs text-ivory/35">
                        {formatTimestamp(memory.createdAt)}
                      </span>
                    </div>
                    <h2 className="line-clamp-2 font-serif text-lg font-semibold text-ivory">
                      {memory.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-ivory/55">
                      {memory.description || "No description."}
                    </p>
                    <div className="mt-3 text-sm text-ivory/45">
                      <UserLine profile={usersById.get(memory.userId)} />
                    </div>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Link
                        className="inline-flex min-h-10 items-center justify-center rounded-lg bg-ivory px-4 text-sm font-bold text-night transition hover:bg-ivory/90"
                        href={`/memories/${memory.id}`}
                      >
                        View
                      </Link>
                      <button
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={busyAction === `delete-memory-${memory.id}`}
                        onClick={() => handleDeleteMemory(memory)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {!loading && activeTab === "users" ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {users.map((profile) => {
              const admin = isAdminProfile(profile);
              const nextRole: UserRole = admin ? "user" : "admin";
              const isCurrentUser = profile.id === user?.uid;

              return (
                <article
                  className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-nocturne backdrop-blur"
                  key={profile.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 text-sm font-bold text-ivory">
                        {(profile.displayName || profile.email || "U")
                          .slice(0, 1)
                          .toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate font-serif text-lg font-semibold text-ivory">
                          {profile.displayName || profile.email || profile.id}
                        </h2>
                        <p className="truncate text-sm text-ivory/45">
                          {profile.email || profile.id}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-semibold capitalize text-ivory/65">
                      {admin ? (
                        <ShieldCheck className="h-3.5 w-3.5" />
                      ) : (
                        <UsersRound className="h-3.5 w-3.5" />
                      )}
                      {roleLabel(profile)}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-ivory/35">
                      Joined {formatTimestamp(profile.createdAt)}
                    </p>
                    <button
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-semibold text-ivory/65 transition hover:bg-white/[0.08] hover:text-ivory disabled:cursor-not-allowed disabled:opacity-45"
                      disabled={
                        busyAction === `role-${profile.id}` ||
                        (isCurrentUser && nextRole !== "admin")
                      }
                      onClick={() => handleRoleChange(profile, nextRole)}
                      type="button"
                    >
                      <UserCog className="h-4 w-4" />
                      {admin ? "Remove admin" : "Make admin"}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        ) : null}
    </main>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminPanel />
    </AdminGuard>
  );
}
