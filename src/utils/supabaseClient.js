/**
 * supabaseClient.js
 *
 * Centralized Supabase REST API client for the Iqama App.
 * Uses the same REST pattern as useSquadSync.js (no SDK needed).
 *
 * All database operations go through this file.
 */

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const IS_SUPABASE_READY = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// ─── Headers ─────────────────────────────────────────────────────────────────

function headers(options = {}) {
  const h = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (options.upsert) {
    h["Prefer"] = "resolution=merge-duplicates";
  }
  if (options.returnRow) {
    h["Prefer"] = h["Prefer"]
      ? `${h["Prefer"]},return=representation`
      : "return=representation";
  }
  return h;
}

// ─── Generic REST Helpers ────────────────────────────────────────────────────

/**
 * SELECT rows from a table.
 * @param {string} table - Table name
 * @param {string} query - PostgREST query string (e.g. "squad_code=eq.ABC123&select=*")
 * @returns {Array|null}
 */
export async function dbSelect(table, query = "select=*") {
  if (!IS_SUPABASE_READY) return null;
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) {
      console.warn(`[Supabase] SELECT ${table} failed:`, res.status);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.warn(`[Supabase] SELECT ${table} error:`, e?.message);
    return null;
  }
}

/**
 * INSERT or UPSERT a row.
 * @param {string} table - Table name
 * @param {object} row   - Data to insert
 * @param {object} opts  - { upsert: bool, returnRow: bool }
 * @returns {object|boolean} - Row if returnRow=true, else true/false
 */
export async function dbInsert(table, row, opts = { upsert: true, returnRow: true }) {
  if (!IS_SUPABASE_READY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: headers(opts),
      body: JSON.stringify(row),
    });
    if (!res.ok && res.status !== 201) {
      const text = await res.text();
      console.warn(`[Supabase] INSERT ${table} failed:`, res.status, text);
      return null;
    }
    if (opts.returnRow) {
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data[0] : data;
    }
    return true;
  } catch (e) {
    console.warn(`[Supabase] INSERT ${table} error:`, e?.message);
    return null;
  }
}

/**
 * UPDATE rows matching a filter.
 * @param {string} table  - Table name
 * @param {string} filter - PostgREST filter (e.g. "id=eq.xxx")
 * @param {object} data   - Fields to update
 * @returns {boolean}
 */
export async function dbUpdate(table, filter, data) {
  if (!IS_SUPABASE_READY) return false;
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}?${filter}`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      console.warn(`[Supabase] UPDATE ${table} failed:`, res.status);
      return false;
    }
    return true;
  } catch (e) {
    console.warn(`[Supabase] UPDATE ${table} error:`, e?.message);
    return false;
  }
}

/**
 * Get a single row by column value.
 * @param {string} table  - Table name
 * @param {string} column - Column to match
 * @param {string} value  - Value to match
 * @returns {object|null}
 */
export async function dbGetOne(table, column, value) {
  const rows = await dbSelect(
    table,
    `${column}=eq.${encodeURIComponent(value)}&select=*&limit=1`
  );
  return rows && rows.length > 0 ? rows[0] : null;
}
