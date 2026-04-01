import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const QUEUE_KEY = "iqama_sync_queue";

/**
 * Enqueue an operation to sync when back online.
 * @param {string} type - Operation type (e.g., "prayer_sync", "settings_sync", "streak_sync")
 * @param {object} payload - Data to sync
 */
export async function enqueueSync(type, payload) {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    queue.push({ type, payload, timestamp: Date.now() });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.warn("Failed to enqueue sync:", e);
  }
}

/**
 * Get all pending sync operations.
 */
export async function getPendingSync() {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Clear all pending sync operations.
 */
export async function clearSyncQueue() {
  try {
    await AsyncStorage.removeItem(QUEUE_KEY);
  } catch (e) {
    console.warn("Failed to clear sync queue:", e);
  }
}

/**
 * Process the sync queue when network is available.
 * @param {function} processor - Async function that processes a single queue item. Returns true on success.
 */
export async function processSyncQueue(processor) {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return;

  const queue = await getPendingSync();
  if (!queue.length) return;

  const failed = [];
  for (const item of queue) {
    try {
      const success = await processor(item);
      if (!success) failed.push(item);
    } catch {
      failed.push(item);
    }
  }

  if (failed.length) {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(failed));
  } else {
    await clearSyncQueue();
  }
}
