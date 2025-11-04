/**
 * IndexedDB utility for managing search history
 */

const DB_NAME = "gtfs-wayfinder-history";
const DB_VERSION = 1;
const BUS_STOP_STORE = "busStopSearches";
const ROUTE_STORE = "routeSearches";

export interface BusStopSearchRecord {
  id: string;
  stopId: string;
  name: string;
  distance: string;
  searchedAt: number; // timestamp
}

export interface RouteSearchRecord {
  id: string;
  fromStopId: string;
  toStopId: string;
  fromStopName: string;
  toStopName: string;
  searchedAt: number; // timestamp
}

/**
 * Open or create the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create bus stop searches store
      if (!db.objectStoreNames.contains(BUS_STOP_STORE)) {
        const busStopStore = db.createObjectStore(BUS_STOP_STORE, {
          keyPath: "id",
        });
        busStopStore.createIndex("searchedAt", "searchedAt", { unique: false });
        busStopStore.createIndex("stopId", "stopId", { unique: false });
      }

      // Create route searches store
      if (!db.objectStoreNames.contains(ROUTE_STORE)) {
        const routeStore = db.createObjectStore(ROUTE_STORE, {
          keyPath: "id",
        });
        routeStore.createIndex("searchedAt", "searchedAt", { unique: false });
      }
    };
  });
}

/**
 * Add a bus stop search to history
 * @param stopId - The ID of the bus stop
 * @param name - The name of the bus stop
 * @param distance - The distance description to the bus stop
 * @param searchedAt - The timestamp indicating when the search was ran. If not provided, uses current time.
 */
export async function addBusStopSearch(
  stopId: string,
  name: string,
  distance: string,
  searchedAt?: number
): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([BUS_STOP_STORE], "readwrite");
  const store = transaction.objectStore(BUS_STOP_STORE);

  const record: BusStopSearchRecord = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${stopId}-${Date.now()}-${Math.random()}`,
    stopId,
    name,
    distance,
    searchedAt: searchedAt ?? Date.now(),
  };

  return new Promise((resolve, reject) => {
    const request = store.add(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Add a route search to history
 * @param searchedAt - Optional timestamp for testing. If not provided, uses current time.
 */
export async function addRouteSearch(
  fromStopId: string,
  toStopId: string,
  fromStation: string,
  toStation: string,
  searchedAt?: number
): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([ROUTE_STORE], "readwrite");
  const store = transaction.objectStore(ROUTE_STORE);

  const record: RouteSearchRecord = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${fromStopId}-${toStopId}-${Date.now()}-${Math.random()}`,
    fromStopId,
    toStopId,
    fromStopName: fromStation,
    toStopName: toStation,
    searchedAt: searchedAt ?? Date.now(),
  };

  return new Promise((resolve, reject) => {
    const request = store.add(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get recent bus stop searches
 */
export async function getBusStopSearches(
  limit = 10
): Promise<BusStopSearchRecord[]> {
  const db = await openDB();
  const transaction = db.transaction([BUS_STOP_STORE], "readonly");
  const store = transaction.objectStore(BUS_STOP_STORE);
  const index = store.index("searchedAt");

  return new Promise((resolve, reject) => {
    const request = index.openCursor(null, "prev");
    const results: BusStopSearchRecord[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor && results.length < limit) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Get recent route searches
 */
export async function getRouteSearches(
  limit = 10
): Promise<RouteSearchRecord[]> {
  const db = await openDB();
  const transaction = db.transaction([ROUTE_STORE], "readonly");
  const store = transaction.objectStore(ROUTE_STORE);
  const index = store.index("searchedAt");

  return new Promise((resolve, reject) => {
    const request = index.openCursor(null, "prev");
    const results: RouteSearchRecord[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor && results.length < limit) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all bus stop search history
 */
export async function clearBusStopSearches(): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([BUS_STOP_STORE], "readwrite");
  const store = transaction.objectStore(BUS_STOP_STORE);

  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all route search history
 */
export async function clearRouteSearches(): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([ROUTE_STORE], "readwrite");
  const store = transaction.objectStore(ROUTE_STORE);

  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
