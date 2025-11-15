import { openDB } from 'idb';

const DB_NAME = 'TravelPlannerDB';
const STORE_NAME = 'offlineQueue';
const DB_VERSION = 1;

let db = null;

export const initDB = async () => {
  if (db) return db;

  try {
    db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
          store.createIndex('status', 'status');
          store.createIndex('queuedAt', 'queuedAt');
          console.log('[DB] Offline queue store created');
        }
      },
    });
    return db;
  } catch (error) {
    console.error('[DB] Error initializing database:', error);
    throw error;
  }
};

export const addToQueue = async (item) => {
  const database = await initDB();
  return database.add(STORE_NAME, item);
};

export const getQueue = async () => {
  const database = await initDB();
  return database.getAll(STORE_NAME);
};

export const getQueueByStatus = async (status) => {
  const database = await initDB();
  return database.getAllFromIndex(STORE_NAME, 'status', status);
};

export const updateQueueItem = async (id, data) => {
  const database = await initDB();
  const item = await database.get(STORE_NAME, id);
  if (item) {
    return database.put(STORE_NAME, { ...item, ...data });
  }
};

export const removeFromQueue = async (id) => {
  const database = await initDB();
  return database.delete(STORE_NAME, id);
};

export const clearQueue = async () => {
  const database = await initDB();
  return database.clear(STORE_NAME);
};

export const clearOldQueue = async (days = 7) => {
  const database = await initDB();
  const allItems = await database.getAll(STORE_NAME);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  for (const item of allItems) {
    if (new Date(item.queuedAt) < cutoffDate) {
      await database.delete(STORE_NAME, item.id);
    }
  }
};
