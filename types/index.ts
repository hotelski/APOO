import type { Timestamp } from "firebase/firestore";

export type MemoryPrivacy = "private" | "public";

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Timestamp | null;
};

export type Memory = {
  id: string;
  userId: string;
  title: string;
  description: string;
  imageUrl: string;
  imagePath?: string;
  latitude: number;
  longitude: number;
  privacy: MemoryPrivacy;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type Report = {
  id: string;
  memoryId: string;
  reporterId: string;
  reason: string;
  createdAt: Timestamp | null;
};

export type CreateMemoryInput = {
  userId: string;
  title: string;
  description: string;
  imageFile?: File | null;
  latitude: number;
  longitude: number;
  privacy: MemoryPrivacy;
};
