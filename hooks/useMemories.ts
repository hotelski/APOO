"use client";

import { useEffect, useMemo, useState } from "react";
import {
  subscribeMyMemories,
  subscribePublicMemories,
} from "@/lib/memories";
import type { Memory } from "@/types";

function sortNewestFirst(memories: Memory[]) {
  return memories.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
}

export function useVisibleMemories(userId: string | undefined) {
  const [publicMemories, setPublicMemories] = useState<Memory[]>([]);
  const [myMemories, setMyMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let publicReady = false;
    let mineReady = false;

    const markReady = () => {
      if (publicReady && mineReady) {
        setLoading(false);
      }
    };

    const unsubscribePublic = subscribePublicMemories((memories) => {
      publicReady = true;
      setPublicMemories(memories);
      markReady();
    });

    const unsubscribeMine = subscribeMyMemories(userId, (memories) => {
      mineReady = true;
      setMyMemories(memories);
      markReady();
    });

    return () => {
      unsubscribePublic();
      unsubscribeMine();
    };
  }, [userId]);

  const memories = useMemo(() => {
    const byId = new Map<string, Memory>();

    for (const memory of publicMemories) {
      byId.set(memory.id, memory);
    }

    for (const memory of myMemories) {
      byId.set(memory.id, memory);
    }

    return sortNewestFirst(Array.from(byId.values()));
  }, [myMemories, publicMemories]);

  return { memories, loading };
}

export function useMyMemories(userId: string | undefined) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      return;
    }

    return subscribeMyMemories(userId, (nextMemories) => {
      setMemories(nextMemories);
      setLoading(false);
    });
  }, [userId]);

  return { memories, loading };
}
