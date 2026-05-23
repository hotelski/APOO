import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  type DocumentData,
  type QuerySnapshot,
  where,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import type { CreateMemoryInput, Memory } from "@/types";

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

function sortNewestFirst(memories: Memory[]) {
  return memories.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
}

function serializeMemorySnapshot(snapshot: QuerySnapshot<DocumentData>) {
  return sortNewestFirst(
    snapshot.docs.map((memoryDoc) => serializeMemory(memoryDoc.id, memoryDoc.data())),
  );
}

async function uploadMemoryImage(file: File, userId: string) {
  const safeName = file.name.replace(/[^a-z0-9.]+/gi, "-").toLowerCase();
  const imagePath = `memories/${userId}/${crypto.randomUUID()}-${safeName}`;
  const imageRef = ref(storage, imagePath);

  await uploadBytes(imageRef, file);

  return {
    url: await getDownloadURL(imageRef),
    path: imagePath,
  };
}

export function subscribePublicMemories(onChange: (memories: Memory[]) => void) {
  return onSnapshot(
    query(collection(db, "memories"), where("privacy", "==", "public")),
    (snapshot) => onChange(serializeMemorySnapshot(snapshot)),
  );
}

export function subscribeMyMemories(
  userId: string,
  onChange: (memories: Memory[]) => void,
) {
  return onSnapshot(
    query(collection(db, "memories"), where("userId", "==", userId)),
    (snapshot) => onChange(serializeMemorySnapshot(snapshot)),
  );
}

export async function createMemory(input: CreateMemoryInput) {
  const image = input.imageFile
    ? await uploadMemoryImage(input.imageFile, input.userId)
    : null;

  const memoryRef = await addDoc(collection(db, "memories"), {
    userId: input.userId,
    title: input.title.trim(),
    description: input.description.trim(),
    imageUrl: image?.url ?? "",
    imagePath: image?.path ?? "",
    latitude: input.latitude,
    longitude: input.longitude,
    privacy: input.privacy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return memoryRef.id;
}

export async function getMemory(memoryId: string) {
  const snapshot = await getDoc(doc(db, "memories", memoryId));

  if (!snapshot.exists()) {
    return null;
  }

  return serializeMemory(snapshot.id, snapshot.data());
}

export async function deleteMemory(memory: Memory, currentUserId: string) {
  if (memory.userId !== currentUserId) {
    throw new Error("Only the memory owner can delete this memory.");
  }

  await deleteDoc(doc(db, "memories", memory.id));

  if (memory.imagePath) {
    await deleteObject(ref(storage, memory.imagePath)).catch(() => undefined);
  }
}

export async function reportMemory(
  memoryId: string,
  reporterId: string,
  reason: string,
) {
  await addDoc(collection(db, "reports"), {
    memoryId,
    reporterId,
    reason: reason.trim(),
    createdAt: serverTimestamp(),
  });
}
