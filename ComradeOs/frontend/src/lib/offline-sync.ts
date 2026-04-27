import { SyncQueue } from "./sync_queue";

// We need to bypass the standard queueing mechanism when replaying to avoid infinite loops
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class OfflineSyncManager {
  private static isProcessing = false;

  static init() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline);
      console.log("[Offline Sync] Initialized online event listener.");
      
      // If we boot up online, try to flush immediately
      if (navigator.onLine) {
        this.processQueue();
      }
    }
  }

  static removeListeners() {
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.handleOnline);
    }
  }

  private static handleOnline = () => {
    console.log("[Offline Sync] Network connection restored. Processing queue...");
    OfflineSyncManager.processQueue();
  };

  static async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const queue = SyncQueue.peekAll();
    if (queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    console.log(`[Offline Sync] Found ${queue.length} queued actions. Replaying...`);

    // We process sequentially to maintain chronological integrity
    while (true) {
      const action = SyncQueue.dequeue();
      if (!action) break; // Queue empty

      try {
        const headers = action.headers || { "Content-Type": "application/json" };
        const token = localStorage.getItem("comradeos_token");
        if (token && !headers["Authorization"]) {
           headers["Authorization"] = `Bearer ${token}`;
        }

        const config: RequestInit = {
          method: action.method,
          headers,
        };

        if (action.payload) {
          config.body = JSON.stringify(action.payload);
        }

        // Direct fetch to bypass the intercepted api.ts
        const response = await fetch(`${API_BASE_URL}${action.url}`, config);

        if (!response.ok) {
          // If it fails with a 4xx or 5xx, it means it reached the server but the data was bad.
          // We don't requeue it, we drop it to avoid poison pills.
          console.error(`[Offline Sync] Action ${action.id} rejected by server with status ${response.status}. Dropping.`);
        } else {
          console.log(`[Offline Sync] Action ${action.id} synced successfully.`);
        }
      } catch (e) {
        // Network error (Failed to fetch). We must abort processing and push the action back to the front.
        console.warn(`[Offline Sync] Network dropped during replay of ${action.id}. Re-queueing.`);
        // We put it back at the front by unshifting directly to localStorage, but we can just use enqueue 
        // since we are aborting. For exact ordering, we should write a requeue logic.
        const currentQueue = SyncQueue.peekAll();
        currentQueue.unshift(action);
        // Hack to save directly since saveQueue is private, but we can just add a public method or recreate it
        localStorage.setItem('comradeos_sync_queue', JSON.stringify(currentQueue));
        break; // Stop processing the rest of the queue
      }
    }

    this.isProcessing = false;
  }
}
