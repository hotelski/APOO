import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import type { Memory, Report, UserProfile, UserRole } from "@/types";

function serializeUser(id: string, data: DocumentData): UserProfile {
  return {
    id,
    email: data.email ?? "",
    displayName: data.displayName ?? "",
    photoURL: data.photoURL ?? "",
    role: data.role === "admin" ? "admin" : "user",
    isAdmin: data.isAdmin === true,
    createdAt: data.createdAt ?? null,
  };
}

function serializeMemory(id: string, data: DocumentData): Memory {
  return {
    id,
    userId: data.userId ?? "",
    title: data.title ?? "",
    description: data.description ?? "",
    imageUrl: data.imageUrl ?? "",
    imagePath: data.imagePath,
    latitude: Number(data.latitude ?? 0),
    longitude: Number(data.longitude ?? 0),
    privacy: data.privacy === "public" ? "public" : "private",
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

function serializeReport(id: string, data: DocumentData): Report {
  return {
    id,
    memoryId: data.memoryId ?? "",
    reporterId: data.reporterId ?? "",
    reason: data.reason ?? "",
    createdAt: data.createdAt ?? null,
  };
}

function byNewest<T extends { createdAt: { toMillis?: () => number } | null }>(
  items: T[],
) {
  return items.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
}

function serializeUsersSnapshot(snapshot: QuerySnapshot<DocumentData>) {
  return byNewest(snapshot.docs.map((userDoc) => serializeUser(userDoc.id, userDoc.data())));
}

function serializeMemoriesSnapshot(snapshot: QuerySnapshot<DocumentData>) {
  return byNewest(
    snapshot.docs.map((memoryDoc) => serializeMemory(memoryDoc.id, memoryDoc.data())),
  );
}

function serializeReportsSnapshot(snapshot: QuerySnapshot<DocumentData>) {
  return byNewest(
    snapshot.docs.map((reportDoc) => serializeReport(reportDoc.id, reportDoc.data())),
  );
}

export function subscribeAdminUsers(
  onChange: (users: UserProfile[]) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    collection(db, "users"),
    (snapshot) => {
      onChange(serializeUsersSnapshot(snapshot));
    },
    onError,
  );
}

export function subscribeAdminMemories(
  onChange: (memories: Memory[]) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    collection(db, "memories"),
    (snapshot) => {
      onChange(serializeMemoriesSnapshot(snapshot));
    },
    onError,
  );
}

export function subscribeAdminReports(
  onChange: (reports: Report[]) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    collection(db, "reports"),
    (snapshot) => {
      onChange(serializeReportsSnapshot(snapshot));
    },
    onError,
  );
}

export async function setUserRole(userId: string, role: UserRole) {
  await updateDoc(doc(db, "users", userId), { role, isAdmin: role === "admin" });
}

export async function dismissReport(reportId: string) {
  await deleteDoc(doc(db, "reports", reportId));
}

export async function deleteMemoryAsAdmin(memory: Memory) {
  await deleteDoc(doc(db, "memories", memory.id));

  if (memory.imagePath) {
    await deleteObject(ref(storage, memory.imagePath)).catch(() => undefined);
  }
}
