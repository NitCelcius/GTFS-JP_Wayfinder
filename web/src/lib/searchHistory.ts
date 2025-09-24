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
  async addBusStopSearch(
    stopId: string,
    name: string,
    distance: string = ""
  ): Promise<void> {
    const db = await this.getDB();
    const timestamp = Date.now();
    const now = new Date(timestamp);
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;

    // Create a unique search record
    const search: RecentBusStopSearch = {
      id: `${stopId}-${timestamp}`, // Make unique with timestamp
      name,
      distance,
      searchedAt: `今日 ${timeString}`,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BUS_STOP_STORE], "readwrite");
      const store = transaction.objectStore(BUS_STOP_STORE);
      const request = store.add({ ...search, timestamp });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getBusStopSearches(limit: number = 10): Promise<RecentBusStopSearch[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BUS_STOP_STORE], "readonly");
      const store = transaction.objectStore(BUS_STOP_STORE);
      const index = store.index("searchedAt");
      const request = index.openCursor(null, "prev"); // Most recent first
      const results: RecentBusStopSearch[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && results.length < limit) {
          const record = cursor.value;
          results.push({
            id: record.id,
            name: record.name,
            distance: record.distance,
            searchedAt: record.searchedAt,
          });
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Route search history methods
  async addRouteSearch(fromStation: string, toStation: string): Promise<void> {
    const db = await this.getDB();
    const timestamp = Date.now();
    const now = new Date(timestamp);
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;

    const search: RecentRouteSearch = {
      id: `${fromStation}-${toStation}-${timestamp}`, // Make unique with timestamp
      fromStation,
      toStation,
      searchedAt: `今日 ${timeString}`,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ROUTE_SEARCH_STORE], "readwrite");
      const store = transaction.objectStore(ROUTE_SEARCH_STORE);
      const request = store.add({ ...search, timestamp });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getRouteSearches(limit: number = 10): Promise<RecentRouteSearch[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ROUTE_SEARCH_STORE], "readonly");
      const store = transaction.objectStore(ROUTE_SEARCH_STORE);
      const index = store.index("searchedAt");
      const request = index.openCursor(null, "prev"); // Most recent first
      const results: RecentRouteSearch[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && results.length < limit) {
          const record = cursor.value;
          results.push({
            id: record.id,
            fromStation: record.fromStation,
            toStation: record.toStation,
            searchedAt: record.searchedAt,
          });
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async clearAllHistory(): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [BUS_STOP_STORE, ROUTE_SEARCH_STORE],
        "readwrite"
      );
      let completed = 0;
      const errors: Error[] = [];

      const checkComplete = () => {
        completed++;
        if (completed === 2) {
          if (errors.length > 0) {
            reject(errors[0]);
          } else {
            resolve();
          }
        }
      };

      // Clear bus stop searches
      const busStopStore = transaction.objectStore(BUS_STOP_STORE);
      const busStopRequest = busStopStore.clear();
      busStopRequest.onsuccess = () => checkComplete();
      busStopRequest.onerror = () => {
        errors.push(new Error("Failed to clear bus stop searches"));
        checkComplete();
      };

      // Clear route searches
      const routeStore = transaction.objectStore(ROUTE_SEARCH_STORE);
      const routeRequest = routeStore.clear();
      routeRequest.onsuccess = () => checkComplete();
      routeRequest.onerror = () => {
        errors.push(new Error("Failed to clear route searches"));
        checkComplete();
      };
    });
  }
}

// Create singleton instance
export const searchHistoryService = new SearchHistoryService();
