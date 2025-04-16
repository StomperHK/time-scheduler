const SCHEDULES_DB_NAME = 'Schedules';
const SCHEDULES_DB_VERSION = 1;
const DAY_SCHEDULES_STORE = 'DaySchedules';

export class SchedulesStorage {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(SCHEDULES_DB_NAME, SCHEDULES_DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(DAY_SCHEDULES_STORE)) {
          const objectStore = db.createObjectStore(DAY_SCHEDULES_STORE, { keyPath: 'id' });

          objectStore.createIndex("data", "data")
          objectStore.createIndex("localOpeningAndClosingTime", "localOpeningAndClosingTime")
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = (event) => {
        reject(`IndexedDB error: ${event.target.errorCode}`);
      };
    });
  }

  async addOrUpdate(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(`Error adding/updating data: ${event.target.errorCode}`);
    });
  }

  async get(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(`Error retrieving data: ${event.target.errorCode}`);
    });
  }

  async delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(`Error deleting data: ${event.target.errorCode}`);
    });
  }

  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(`Error retrieving all data: ${event.target.errorCode}`);
    });
  }
}
