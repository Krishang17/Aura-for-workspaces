import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";

// ── User Preferences ──

export interface UserPreferences {
  quietMode: boolean;
  connectedProviders: string[];
  privacySettings: {
    allowEmailAccess: boolean;
    allowCalendarAccess: boolean;
    allowSlackAccess: boolean;
  };
  notificationPreferences: {
    morningBriefing: boolean;
    urgentOnly: boolean;
  };
}

const DEFAULT_PREFERENCES: UserPreferences = {
  quietMode: false,
  connectedProviders: [],
  privacySettings: {
    allowEmailAccess: true,
    allowCalendarAccess: true,
    allowSlackAccess: true,
  },
  notificationPreferences: {
    morningBriefing: true,
    urgentOnly: false,
  },
};

export async function getUserPreferences(
  userId: string
): Promise<UserPreferences> {
  const ref = doc(db, "users", userId, "settings", "preferences");
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as UserPreferences;
  }
  await setDoc(ref, DEFAULT_PREFERENCES);
  return DEFAULT_PREFERENCES;
}

export async function updateUserPreferences(
  userId: string,
  prefs: Partial<UserPreferences>
) {
  const ref = doc(db, "users", userId, "settings", "preferences");
  await updateDoc(ref, prefs as DocumentData);
}

// ── AuraItem — the unified data model ──

export type AuraSource = "gmail" | "outlook" | "slack" | "calendar";
export type AuraItemType = "email" | "message" | "event" | "task";
export type UrgencyLevel = "low" | "medium" | "high" | "critical";
export type SentimentLevel = "positive" | "neutral" | "negative";

export interface AuraItem {
  id: string;
  userId: string;
  source: AuraSource;
  type: AuraItemType;
  timestamp: Date;
  from: string;
  subject?: string;
  body: string;
  urgency: UrgencyLevel;
  sentiment?: SentimentLevel;
  actionItems?: string[];
  attachments?: { name: string; type: string; summary?: string }[];
  read: boolean;
  raw?: Record<string, unknown>;
}

export async function saveAuraItem(item: AuraItem) {
  const ref = doc(db, "users", item.userId, "items", item.id);
  await setDoc(ref, { ...item, createdAt: serverTimestamp() });
}

export async function getAuraItems(
  userId: string,
  options?: {
    source?: AuraSource;
    type?: AuraItemType;
    maxItems?: number;
  }
) {
  const colRef = collection(db, "users", userId, "items");
  const constraints: QueryConstraint[] = [orderBy("timestamp", "desc")];

  if (options?.source) {
    constraints.unshift(where("source", "==", options.source));
  }
  if (options?.type) {
    constraints.unshift(where("type", "==", options.type));
  }
  if (options?.maxItems) {
    constraints.push(limit(options.maxItems));
  }

  const q = query(colRef, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as AuraItem);
}

// ── Briefings ──

export interface Briefing {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  summary: string;
  conflicts: string[];
  actionItems: string[];
  createdAt: unknown;
}

export async function saveBriefing(briefing: Briefing) {
  const ref = doc(
    db,
    "users",
    briefing.userId,
    "briefings",
    briefing.date
  );
  await setDoc(ref, { ...briefing, createdAt: serverTimestamp() });
}

export async function getLatestBriefing(
  userId: string
): Promise<Briefing | null> {
  const colRef = collection(db, "users", userId, "briefings");
  const q = query(colRef, orderBy("createdAt", "desc"), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as Briefing;
}
