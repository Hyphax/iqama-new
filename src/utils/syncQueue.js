import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const QUEUE_KEY = "iqama_sync_queue";
const MAX_QUEUE_SIZE = 200;
const MAX_RETRIES = 5;

// Simple async mutex for serializing queue mutations
let _lock = Promise.resolve();
function withQueueLock(fn) {
  _lock = _lock.then(fn, fn);
  return _lock;
}

export async function enqueueSync(type, payload) {
  return withQueueLock(async () => {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      const queue = raw ? JSON.parse(raw) : [];
      if (queue.length >= MAX_QUEUE_SIZE) {
        queue.shift(); // drop oldest
      }
      queue.push({ type, payload, timestamp: Date.now(), retryCount: 0 });
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn("Failed to enqueue sync:", e);
    }
  });
}

export async function getPendingSync() {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function clearSyncQueue() {
  return withQueueLock(async () => {
    try {
      await AsyncStorage.removeItem(QUEUE_KEY);
    } catch (e) {
      console.warn("Failed to clear sync queue:", e);
    }
  });
}

export async function processSyncQueue(processor) {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return;

  return withQueueLock(async () => {
    const queue = await getPendingSync();
    if (!queue.length) return;

    const failed = [];
    for (const item of queue) {
      try {
        const success = await processor(item);
        if (!success) {
          item.retryCount = (item.retryCount || 0) + 1;
          if (item.retryCount < MAX_RETRIES) {
            failed.push(item);
          }
        }
      } catch {
        item.retryCount = (item.retryCount || 0) + 1;
        if (item.retryCount < MAX_RETRIES) {
          failed.push(item);
        }
      }
    }

    if (failed.length) {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(failed));
    } else {
      await AsyncStorage.removeItem(QUEUE_KEY);
    }
  });
}
