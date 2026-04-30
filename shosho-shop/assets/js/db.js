const DB_NAME = 'ShoshoOffline';
let db;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('pendingSales')) {
                db.createObjectStore('pendingSales', { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onsuccess = (e) => { db = e.target.result; resolve(db); };
        request.onerror = reject;
    });
}

async function savePendingSale(saleData) {
    if (!db) await openDB();
    const tx = db.transaction('pendingSales', 'readwrite');
    tx.objectStore('pendingSales').add({ ...saleData, status: 'pending', timestamp: new Date().toISOString() });
    return tx.complete;
}

async function syncPendingSales() {
    if (!db) await openDB();
    const tx = db.transaction('pendingSales', 'readonly');
    const store = tx.objectStore('pendingSales');
    const all = await new Promise(r => { const req = store.getAll(); req.onsuccess = () => r(req.result); });
    if (all.length === 0) return;
    const res = await fetch('api/sync.php', { method: 'POST', body: JSON.stringify(all) });
    if (res.ok) {
        const delTx = db.transaction('pendingSales', 'readwrite');
        const delStore = delTx.objectStore('pendingSales');
        all.forEach(s => delStore.delete(s.id));
    }
}

window.addEventListener('online', syncPendingSales);