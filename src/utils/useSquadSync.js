/**
 * useSquadSync.js
 *
 * Real squad feature — syncs prayer data between friends using Supabase.
 *
 * ─── ONE-TIME SETUP (takes ~3 minutes) ──────────────────────────────────────
 *
 *  1. Go to https://supabase.com → "New project" (free tier is fine)
 *
 *  2. In the SQL Editor, run:
 *
 *       create table if not exists squad_members (
 *         user_code   text primary key,
 *         display_name text not null,
 *         prayers     jsonb not null default '{}',
 *         streak      integer not null default 0,
 *         updated_at  timestamptz default now()
 *       );
 *       alter table squad_members enable row level security;
 *       create policy "public_read"   on squad_members for select using (true);
 *       create policy "public_write"  on squad_members for insert with check (true);
 *       create policy "public_update" on squad_members for update using (true);
 *
 *  3. Create a file called `.env` in `apps/mobile/` with:
 *
 *       EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
 *       EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *     (Both values are in Supabase → Project Settings → API)
 *
 * ────────────────────────────────────────────────────────────────────────────
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback, useRef } from "react";

// ─── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** True only when both env vars are present */
export const SUPABASE_CONFIGURED = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// ─── Storage keys ─────────────────────────────────────────────────────────────

const MY_CODE_KEY    = "iqama_my_squad_code_v2";   // own persistent code
const FRIEND_CODES_KEY = "iqama_squad_friend_codes"; // array of friend codes

// ─── Poll interval ─────────────────────────────────────────────────────────────

const POLL_MS = 60 * 1000; // refresh friends every 60 seconds

// ─── Code generation ──────────────────────────────────────────────────────────

/**
 * Generates a random 6-character uppercase code.
 * Excludes visually confusing characters: 0, O, 1, I, L.
 */
function generateCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Returns this user's persistent squad code.
 * Creates and saves a new one on first call.
 */
export async function getMySquadCode() {
  try {
    const stored = await AsyncStorage.getItem(MY_CODE_KEY);
    if (stored) return { code: stored, fromStorage: true };
    const fresh = generateCode();
    await AsyncStorage.setItem(MY_CODE_KEY, fresh);
    return { code: fresh, fromStorage: true };
  } catch {
    // Fallback: just return a code (won't persist on error, but won't crash).
    // fromStorage=false signals callers that this code is ephemeral and must
    // NOT be used to create a new cloud user row (it would be a duplicate).
    return { code: generateCode(), fromStorage: false };
  }
}

// ─── Supabase REST helpers ────────────────────────────────────────────────────

function headers() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/** Upsert a row in `squad_members` */
async function dbUpsert(row) {
  if (!SUPABASE_CONFIGURED) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/squad_members`, {
      method: "POST",
      headers: { ...headers(), Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify(row),
    });
    return res.ok || res.status === 201;
  } catch (e) {
    console.warn("[Squad] dbUpsert failed:", e?.message);
    return false;
  }
}

/** Fetch a single row by user_code */
async function dbFetchByCode(code) {
  if (!SUPABASE_CONFIGURED) return null;
  try {
    const url = `${SUPABASE_URL}/rest/v1/squad_members?user_code=eq.${encodeURIComponent(code)}&select=*&limit=1`;
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) return null;
    const rows = await res.json();
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  } catch (e) {
    console.warn("[Squad] dbFetchByCode failed:", e?.message);
    return null;
  }
}

// ─── Public sync helpers ──────────────────────────────────────────────────────

/**
 * Upload the current user's prayer data.
 * Safe to call every time prayers change — uses upsert.
 */
export async function syncMyData({ code, displayName, prayers, streak }) {
  if (!code || !displayName) return false;
  try {
    return await dbUpsert({
      user_code:    code,
      display_name: displayName,
      prayers:      prayers  ?? {},
      streak:       streak   ?? 0,
      updated_at:   new Date().toISOString(),
    });
  } catch (e) {
    console.warn("[Squad] syncMyData failed:", e?.message);
    return false;
  }
}

/**
 * Check whether a code exists in the database.
 * Returns { valid: bool, name: string|null }
 */
export async function validateFriendCode(rawCode) {
  const code = rawCode.trim().toUpperCase();
  if (!code || code.length < 4) return { valid: false, name: null };
  const row = await dbFetchByCode(code);
  if (!row) return { valid: false, name: null };
  return { valid: true, name: row.display_name };
}

// ─── Row → friend object ──────────────────────────────────────────────────────

function rowToFriend(row) {
  return {
    code:     row.user_code,
    name:     row.display_name,
    ini:      makeInitials(row.display_name),
    prayers:  row.prayers  ?? {},
    streak:   row.streak   ?? 0,
    lastSeen: row.updated_at ?? null,
  };
}

// ─── Main hook ────────────────────────────────────────────────────────────────

/**
 * useSquad
 *
 * @param {object} params
 * @param {string} params.displayName  — The logged-in user's display name
 * @param {object} params.myPrayers    — Today's prayer map  { Fajr: bool, ... }
 * @param {number} params.myStreak     — Current streak count
 *
 * @returns {object}
 *   myCode       {string|null}    — This user's shareable 6-char squad code
 *   squadData    {Array}          — Array of friend objects with live prayer data
 *   loading      {boolean}        — True on first load
 *   syncing      {boolean}        — True while fetching updates in background
 *   isConfigured {boolean}        — False if Supabase env vars are missing
 *   addFriend    {function}       — (code: string) => Promise<{success,name}|{error}>
 *   removeFriend {function}       — (code: string) => Promise<void>
 *   refresh      {function}       — () => void  — force a re-fetch
 */
export function useSquad({ displayName, myPrayers, myStreak }) {
  const [myCode,      setMyCode]      = useState(null);
  const [friendCodes, setFriendCodes] = useState(null); // null = not yet loaded
  const [squadData,   setSquadData]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [syncing,     setSyncing]     = useState(false);
  const [hasPersistentCode, setHasPersistentCode] = useState(false);

  const isMounted  = useRef(true);
  const pollRef    = useRef(null);

  // ── Load my code + persisted friend codes on mount ────────────────────────
  useEffect(() => {
    isMounted.current = true;
    (async () => {
      const { code, fromStorage }  = await getMySquadCode();
      const raw   = await AsyncStorage.getItem(FRIEND_CODES_KEY);
      const codes = raw ? JSON.parse(raw) : [];
      if (isMounted.current) {
        setMyCode(code);
        setHasPersistentCode(fromStorage);
        setFriendCodes(codes);
      }
    })();
    return () => { isMounted.current = false; };
  }, []);

  // ── Upload my prayer data whenever it changes ─────────────────────────────
  useEffect(() => {
    if (!myCode || !displayName || !hasPersistentCode) return;
    syncMyData({ code: myCode, displayName, prayers: myPrayers, streak: myStreak });
  }, [myCode, displayName, myPrayers, myStreak, hasPersistentCode]);

  // ── Fetch all friends in parallel ─────────────────────────────────────────
  const fetchAllFriends = useCallback(async (codes) => {
    if (!codes || codes.length === 0) {
      if (isMounted.current) { setSquadData([]); setLoading(false); }
      return;
    }
    if (isMounted.current) setSyncing(true);

    try {
      const settled = await Promise.allSettled(codes.map(dbFetchByCode));
      const friends = settled
        .filter((r) => r.status === "fulfilled" && r.value != null)
        .map(({ value }) => rowToFriend(value));

      if (isMounted.current) {
        setSquadData(friends);
      }
    } catch (e) {
      console.warn("[Squad] fetchAllFriends failed:", e?.message);
    } finally {
      if (isMounted.current) {
        setSyncing(false);
        setLoading(false);
      }
    }
  }, []);

  // ── Start polling once friendCodes are loaded ─────────────────────────────
  useEffect(() => {
    if (friendCodes === null) return; // still loading from AsyncStorage
    if (friendCodes.length === 0) { setLoading(false); return; }

    fetchAllFriends(friendCodes);

    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchAllFriends(friendCodes), POLL_MS);

    return () => clearInterval(pollRef.current);
  }, [friendCodes, fetchAllFriends]);

  // ── addFriend ──────────────────────────────────────────────────────────────
  /**
   * Try to add a friend by their squad code.
   * @returns {Promise<{success:true,name:string}|{error:string}>}
   */
  const addFriend = useCallback(async (rawCode) => {
    try {
      const code = rawCode.trim().toUpperCase();

      if (!code || code.length < 4) {
        return { error: "Code bahut chhota hai!" };
      }
      if (code === myCode) {
        return { error: "Yeh aapka apna code hai" };
      }
      if (friendCodes && friendCodes.includes(code)) {
        return { error: "Yeh dost pehle se squad mein hai!" };
      }

      const { valid, name } = await validateFriendCode(code);
      if (!valid) {
        return { error: "Code nahi mila. Dost se sahi code maango." };
      }

      const updated = [...(friendCodes ?? []), code];
      if (isMounted.current) setFriendCodes(updated);
      await AsyncStorage.setItem(FRIEND_CODES_KEY, JSON.stringify(updated));
      await fetchAllFriends(updated);

      return { success: true, name };
    } catch (e) {
      console.warn("[Squad] addFriend failed:", e?.message);
      return { error: "Friend add karne mein masla hua. Dobara koshish karein." };
    }
  }, [myCode, friendCodes, fetchAllFriends]);

  // ── removeFriend ───────────────────────────────────────────────────────────
  const removeFriend = useCallback(async (code) => {
    const updated = (friendCodes ?? []).filter((c) => c !== code);
    if (isMounted.current) {
      setFriendCodes(updated);
      setSquadData((prev) => prev.filter((f) => f.code !== code));
    }
    await AsyncStorage.setItem(FRIEND_CODES_KEY, JSON.stringify(updated));
  }, [friendCodes]);

  // ── manual refresh ─────────────────────────────────────────────────────────
  const refresh = useCallback(() => {
    fetchAllFriends(friendCodes ?? []);
  }, [friendCodes, fetchAllFriends]);

  return {
    myCode,
    squadData,
    loading,
    syncing,
    isConfigured: SUPABASE_CONFIGURED,
    addFriend,
    removeFriend,
    refresh,
  };
}

// ─── Utility exports ──────────────────────────────────────────────────────────

/**
 * Returns initials from a display name.
 * "Ali Hassan"  → "AH"
 * "Muhammad"    → "MU"
 */
export function makeInitials(name) {
  const parts = (name || "?").trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name ?? "?").trim().slice(0, 2).toUpperCase();
}

/**
 * Human-friendly "last seen" label from an ISO timestamp.
 * e.g. "just now", "5m ago", "3h ago", "2d ago"
 */
export function formatLastSeen(iso) {
  if (!iso) return "";
  try {
    const diffSecs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diffSecs < 60)    return "just now";
    if (diffSecs < 3600)  return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    return `${Math.floor(diffSecs / 86400)}d ago`;
  } catch {
    return "";
  }
}
