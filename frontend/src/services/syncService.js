import api from "./apiService";

const QUEUE_KEY = "offline_sync_queue";

export const addToSyncQueue = (action, type) => {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  queue.push({
    type,
    payload: action,
    id: Date.now(),
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const getSyncQueue = () => {
  return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
};

export const removeFromSyncQueue = (id) => {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  const filtered = queue.filter(item => item.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
};

export const clearSyncQueue = () => {
  localStorage.removeItem(QUEUE_KEY);
};

export const processSyncQueue = async () => {
  if (!navigator.onLine) return;

  const queue = getSyncQueue();
  if (queue.length === 0) return;

  for (const item of queue) {
    try {
      let success = false;
      
      if (item.type === "chat_ask") {
        await api.post("/ai/ask", item.payload);
        success = true;
      } 
      // Add other sync types here
      
      if (success) {
        removeFromSyncQueue(item.id);
      }
    } catch (e) {
      console.error("Sync failed for item:", item.id, e);
    }
  }
};
