/**
 * Minimal IndexedDB key/value store.
 * Used for the offline Bible library — localStorage is far too small (≈5 MB)
 * to hold Scripture, while IndexedDB can hold hundreds of megabytes.
 * Falls back to an in-memory map if IndexedDB is unavailable.
 */
const DB_NAME = "berean-db";
const STORE = "kv";

let dbPromise: Promise<IDBDatabase> | null = null;
const mem = new Map<string, unknown>();

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB error"));
  });
  return dbPromise;
}

export async function idbGet<T>(key: string): Promise<T | undefined> {
  if (mem.has(key)) return mem.get(key) as T;
  try {
    const db = await openDB();
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined;
  }
}

export async function idbSet(key: string, value: unknown): Promise<void> {
  mem.set(key, value);
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* memory-only fallback already applied */
  }
}

export async function idbDel(key: string): Promise<void> {
  mem.delete(key);
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* ignore */
  }
}

export async function idbKeys(prefix?: string): Promise<string[]> {
  let keys: string[] = [];
  try {
    const db = await openDB();
    keys = await new Promise<string[]>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAllKeys();
      req.onsuccess = () => resolve(req.result as string[]);
      req.onerror = () => reject(req.error);
    });
  } catch {
    keys = [...mem.keys()];
  }
  return prefix ? keys.filter((k) => k.startsWith(prefix)) : keys;
}

export async function storageEstimate(): Promise<{ usage: number; quota: number }> {
  try {
    const est = await navigator.storage?.estimate?.();
    return { usage: est?.usage ?? 0, quota: est?.quota ?? 0 };
  } catch {
    return { usage: 0, quota: 0 };
  }
}
