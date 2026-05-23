import type { User } from "firebase/auth";
import { updateProfile } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/types";

export function isAdminProfile(profile: UserProfile | null) {
  return profile?.role === "admin" || profile?.isAdmin === true;
}

export function userDisplayName(user: User | null) {
  return user?.displayName || user?.email?.split("@")[0] || "Friend";
}

export async function createUserProfile(user: User, displayName?: string) {
  const profileRef = doc(db, "users", user.uid);
  const name = displayName?.trim() || userDisplayName(user);

  await setDoc(profileRef, {
    email: user.email ?? "",
    displayName: name,
    photoURL: user.photoURL ?? "",
    role: "user",
    isAdmin: false,
    createdAt: serverTimestamp(),
  });

  return getUserProfile(user.uid);
}

export async function ensureUserProfile(user: User) {
  const profileRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(profileRef);

  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as UserProfile;
  }

  return createUserProfile(user);
}

export async function getUserProfile(userId: string) {
  const snapshot = await getDoc(doc(db, "users", userId));

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() } as UserProfile;
}

export async function updateUserDisplayName(user: User, displayName: string) {
  const cleanName = displayName.trim();

  await updateProfile(user, { displayName: cleanName });
  await updateDoc(doc(db, "users", user.uid), { displayName: cleanName });
}
