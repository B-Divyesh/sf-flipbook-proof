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

export type StorageNamespace = 'real' | 'demo';

const DB_NAMES: Record<StorageNamespace, string> = {
  real: 'flipbook-proof',
  demo: 'demo:flipbook-proof',
};
const STORE = 'projects';
const KEY = 'current';

function openDb(namespace: StorageNamespace): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAMES[namespace], 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProject(project: StoredProject, namespace: StorageNamespace = 'real'): Promise<void> {
  const db = await openDb(namespace);
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(project, KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function loadProject(namespace: StorageNamespace = 'real'): Promise<StoredProject | null> {
  const db = await openDb(namespace);
  const value = await new Promise<StoredProject | null>((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(KEY);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return value;
}

export async function clearProject(namespace: StorageNamespace = 'real'): Promise<void> {
  const db = await openDb(namespace);
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).delete(KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}
