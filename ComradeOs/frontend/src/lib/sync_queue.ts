export interface SyncAction {
  id: string;
  url: string;
  method: string;
  headers?: Record<string, string>;
  payload?: any;
  timestamp: number;
}

const SYNC_QUEUE_KEY = 'comradeos_sync_queue';

export class SyncQueue {
  private static getQueue(): SyncAction[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(SYNC_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to read sync queue from localStorage", e);
      return [];
    }
  }

  private static saveQueue(queue: SyncAction[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error("Failed to write sync queue to localStorage", e);
    }
  }

  static enqueue(action: Omit<SyncAction, 'id' | 'timestamp'>): void {
    const queue = this.getQueue();
    const newAction: SyncAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    queue.push(newAction);
    this.saveQueue(queue);
    console.log(`[Offline Sync] Queued ${action.method} request to ${action.url}`);
  }

  static dequeue(): SyncAction | null {
    const queue = this.getQueue();
    if (queue.length === 0) return null;
    const action = queue.shift();
    this.saveQueue(queue);
    return action || null;
  }

  static peekAll(): SyncAction[] {
    return this.getQueue();
  }

  static clear(): void {
    this.saveQueue([]);
  }
}
