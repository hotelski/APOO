import type { Timestamp } from "firebase/firestore";

export function formatTimestamp(value: Timestamp | null | undefined) {
  if (!value) {
    return "Just now";
  }

  const date = value.toDate();

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
