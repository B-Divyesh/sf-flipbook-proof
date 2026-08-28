import type { BindingSide, Crop, PageOrder } from './proof';

export type ProjectSettings = {
  name: string;
  createdAt: string;
  updatedAt: string;
  sourceDuration: number;
  start: number;
  end: number;
  count: number;
  crop: Crop;
  onionMode: 'previous' | 'next' | 'both' | 'off';
  onionOpacity: number;
  pageSize: 'A4' | 'letter';
  bindingSide: BindingSide;
  pageOrder: PageOrder;
};

export type StoredProject = { settings: ProjectSettings; frames: Blob[] };

const DB_NAME = 'flipbook-proof';
const STORE = 'projects';
const KEY = 'current';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProject(project: StoredProject): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(project, KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function loadProject(): Promise<StoredProject | null> {
  const db = await openDb();
  const value = await new Promise<StoredProject | null>((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(KEY);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return value;
}

export async function clearProject(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).delete(KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}
