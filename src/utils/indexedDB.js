import { openDB } from 'idb';

const DB_NAME = 'vinitaDriveOps';
const DB_VERSION = 2;

export async function initializeDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      // Auth store
      if (!db.objectStoreNames.contains('auth')) {
        db.createObjectStore('auth');
      }

      // Files store
      if (!db.objectStoreNames.contains('files')) {
        const filesStore = db.createObjectStore('files', { keyPath: 'name' });
        filesStore.createIndex('timestamp', 'timestamp');
        filesStore.createIndex('synced', 'synced');
      }
      
      // Trips store
      if (!db.objectStoreNames.contains('trips')) {
        const tripStore = db.createObjectStore('trips', { keyPath: 'id', autoIncrement: true });
        tripStore.createIndex('date', 'date');
        tripStore.createIndex('driverId', 'driverId');
      }

      // Expenses store
      if (!db.objectStoreNames.contains('expenses')) {
        const expenseStore = db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
        expenseStore.createIndex('date', 'date');
        expenseStore.createIndex('driverId', 'driverId');
        expenseStore.createIndex('type', 'type');
      }

      // Sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    }
  });
  return db;
}

export async function setToDB(store, key, value) {
  const db = await openDB(DB_NAME);
  return db.put(store, value, key);
}

export async function getFromDB(store, key) {
  const db = await openDB(DB_NAME);
  return db.get(store, key);
}

export async function getAllFromDB(store, query = null) {
  const db = await openDB(DB_NAME);
  return db.getAll(store, query);
}

export async function deleteFromDB(store, key) {
  const db = await openDB(DB_NAME);
  return db.delete(store, key);
}

export async function addToSyncQueue(action) {
  const db = await openDB(DB_NAME);
  return db.add('syncQueue', {
    action,
    timestamp: new Date().toISOString(),
    status: 'pending'
  });
}

export async function processSyncQueue() {
  const db = await openDB(DB_NAME);
  const tx = db.transaction(['syncQueue', 'files'], 'readwrite');
  const syncStore = tx.objectStore('syncQueue');
  const filesStore = tx.objectStore('files');
  
  const pendingActions = await syncStore.getAll();
  const unsyncedFiles = await filesStore.index('synced').getAll(false);
  
  // Sync regular actions
  for (const action of pendingActions) {
    try {
      const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
        method: 'POST',
        body: JSON.stringify(action)
      });
      
      if (response.ok) {
        await syncStore.delete(action.id);
      }
    } catch (error) {
      console.error('Sync failed for action:', action, error);
    }
  }

  // Sync files
  for (const file of unsyncedFiles) {
    try {
      const fileData = await Filesystem.readFile({
        path: file.uri,
        directory: Directory.Data
      });

      const response = await fetch('YOUR_FILE_UPLOAD_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': file.mimeType
        },
        body: fileData.data
      });

      if (response.ok) {
        file.synced = true;
        await filesStore.put(file);
      }
    } catch (error) {
      console.error('File sync failed:', file, error);
    }
  }
}