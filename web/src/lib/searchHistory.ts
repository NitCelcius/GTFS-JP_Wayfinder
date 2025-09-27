// IndexedDB service for search history management
import { RecentBusStopSearch, RecentRouteSearch } from "@/domains/recent";

const DB_NAME = "GTFS_Wayfinder_SearchHistory";
const DB_VERSION = 1;
const BUS_STOP_STORE = "busStopSearches";
const ROUTE_SEARCH_STORE = "routeSearches";

interface SearchHistoryDB extends IDBDatabase {
  transaction(
    storeNames: string | string[],
    mode?: IDBTransactionMode
  ): IDBTransaction;
}

class SearchHistoryService {
  private db: SearchHistoryDB | null = null;

  async initDB(): Promise<SearchHistoryDB> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result as SearchHistoryDB;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result as SearchHistoryDB;

        // Create bus stop searches store
        if (!db.objectStoreNames.contains(BUS_STOP_STORE)) {
          const busStopStore = db.createObjectStore(BUS_STOP_STORE, {
            keyPath: "id",
          });
          busStopStore.createIndex("searchedAt", "searchedAt", {
            unique: false,
          });
        }

        // Create route searches store
        if (!db.objectStoreNames.contains(ROUTE_SEARCH_STORE)) {
          const routeStore = db.createObjectStore(ROUTE_SEARCH_STORE, {
            keyPath: "id",
          });
          routeStore.createIndex("searchedAt", "searchedAt", { unique: false });
        }
      };
    });
  }

  private async getDB(): Promise<SearchHistoryDB> {
    if (!this.db) {
      return this.initDB();
    }
    return this.db;
  }

  // Bus stop search history methods
  async addBusStopSearch(stopId: string, name: string): Promise<void> {
    const db = await this.getDB();
    const now = new Date();

    // Create a unique search record - only save essential data
    const search = {
      id: `${stopId}-${now.getTime()}`, // Make unique with timestamp
      name,
      searchedAt: now, // Save JS Date object
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BUS_STOP_STORE], "readwrite");
      const store = transaction.objectStore(BUS_STOP_STORE);
      const request = store.add(search);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  private async getSearchHistory<T>(
    storeName: string,
    limit: number,
    mapRecord: (record: Record<string, unknown>) => T,
    startIndex: number = 0
  ): Promise<T[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index("searchedAt");
      const request = index.openCursor(null, "prev"); // Most recent first
      const results: T[] = [];
      let currentIndex = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          // Skip records before startIndex
          if (currentIndex < startIndex) {
            currentIndex++;
            cursor.continue();
            return;
          }

          // Collect records within the limit
          if (results.length < limit) {
            const record = cursor.value;
            results.push(mapRecord(record));
            cursor.continue();
          } else {
            resolve(results);
          }
        } else {
          resolve(results);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getBusStopSearches(
    limit: number = 10,
    startIndex: number = 0
  ): Promise<RecentBusStopSearch[]> {
    return this.getSearchHistory(
      BUS_STOP_STORE,
      limit,
      (record) => ({
        id: record.id,
        name: record.name,
        searchedAt: record.searchedAt, // No assertion needed - already Date object
      }),
      startIndex
    );
  }

  // Route search history methods
  async addRouteSearch(fromStation: string, toStation: string): Promise<void> {
    const db = await this.getDB();
    const now = new Date();

    // Create a unique search record - only save essential data
    const search = {
      id: `${fromStation}-${toStation}-${now.getTime()}`, // Make unique with timestamp
      fromStation,
      toStation,
      searchedAt: now, // Save JS Date object
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ROUTE_SEARCH_STORE], "readwrite");
      const store = transaction.objectStore(ROUTE_SEARCH_STORE);
      const request = store.add(search);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getRouteSearches(
    limit: number = 10,
    startIndex: number = 0
  ): Promise<RecentRouteSearch[]> {
    return this.getSearchHistory(
      ROUTE_SEARCH_STORE,
      limit,
      (record) => ({
        id: record.id,
        fromStation: record.fromStation,
        toStation: record.toStation,
        searchedAt: record.searchedAt, // No assertion needed - already Date object
      }),
      startIndex
    );
  }

  async clearBusStopSearchHistory(): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BUS_STOP_STORE], "readwrite");
      const busStopStore = transaction.objectStore(BUS_STOP_STORE);
      const request = busStopStore.clear();

      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new Error("Failed to clear bus stop searches"));
    });
  }

  async clearRouteSearchHistory(): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ROUTE_SEARCH_STORE], "readwrite");
      const routeStore = transaction.objectStore(ROUTE_SEARCH_STORE);
      const request = routeStore.clear();

      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new Error("Failed to clear route searches"));
    });
  }

  async clearAllHistory(): Promise<void> {
    await Promise.all([
      this.clearBusStopSearchHistory(),
      this.clearRouteSearchHistory(),
    ]);
  }
}

// Create singleton instance
export const searchHistoryService = new SearchHistoryService();
