import "fake-indexeddb/auto";

import {
  BusStopSearchRecord,
  RouteSearchRecord,
  addBusStopSearch,
  addRouteSearch,
  clearBusStopSearches,
  clearRouteSearches,
  getBusStopSearches,
  getRouteSearches,
} from "../indexedDB";

describe("indexedDB", () => {
  beforeEach(async () => {
    // Clear all stores before each test
    await clearBusStopSearches();
    await clearRouteSearches();
  });

  describe("Bus Stop Searches", () => {
    it("should add and retrieve bus stop searches", async () => {
      const timestamp1 = 1000;
      const timestamp2 = 2000;
      await addBusStopSearch("stop1", "中央公園", "徒歩2分", timestamp1);
      await addBusStopSearch("stop2", "市役所前", "徒歩5分", timestamp2);

      const searches = await getBusStopSearches();

      expect(searches).toHaveLength(2);
      expect(searches[0].name).toBe("市役所前");
      expect(searches[1].name).toBe("中央公園");
    });

    it("should retrieve limited number of searches", async () => {
      for (let i = 0; i < 15; i++) {
        await addBusStopSearch(`stop${i}`, `Stop ${i}`, `徒歩${i}分`);
      }

      const searches = await getBusStopSearches(5);

      expect(searches).toHaveLength(5);
    });

    it("should order searches by searchedAt (newest first)", async () => {
      const timestamp1 = 1000;
      const timestamp2 = 2000;
      await addBusStopSearch("stop1", "First Stop", "徒歩1分", timestamp1);
      await addBusStopSearch("stop2", "Second Stop", "徒歩2分", timestamp2);

      const searches = await getBusStopSearches();

      expect(searches[0].name).toBe("Second Stop");
      expect(searches[1].name).toBe("First Stop");
    });

    it("should clear all bus stop searches", async () => {
      await addBusStopSearch("stop1", "中央公園", "徒歩2分");
      await addBusStopSearch("stop2", "市役所前", "徒歩5分");

      let searches = await getBusStopSearches();
      expect(searches).toHaveLength(2);

      await clearBusStopSearches();
      searches = await getBusStopSearches();
      expect(searches).toHaveLength(0);
    });

    it("should store all required fields", async () => {
      await addBusStopSearch("stop1", "中央公園", "徒歩2分");

      const searches = await getBusStopSearches();
      const search = searches[0] as BusStopSearchRecord;

      expect(search.id).toBeDefined();
      expect(search.stopId).toBe("stop1");
      expect(search.name).toBe("中央公園");
      expect(search.distance).toBe("徒歩2分");
      expect(search.searchedAt).toBeDefined();
      expect(typeof search.searchedAt).toBe("number");
    });
  });

  describe("Route Searches", () => {
    it("should add and retrieve route searches", async () => {
      const timestamp1 = 1000;
      const timestamp2 = 2000;
      await addRouteSearch("stop1", "stop2", "東駅", "中央公園", timestamp1);
      await addRouteSearch("stop3", "stop4", "西口", "大学病院", timestamp2);

      const searches = await getRouteSearches();

      expect(searches).toHaveLength(2);
      expect(searches[0].fromStopName).toBe("西口");
      expect(searches[0].toStopName).toBe("大学病院");
      expect(searches[1].fromStopName).toBe("東駅");
      expect(searches[1].toStopName).toBe("中央公園");
    });

    it("should retrieve limited number of searches", async () => {
      for (let i = 0; i < 15; i++) {
        await addRouteSearch(`from${i}`, `to${i}`, `From ${i}`, `To ${i}`);
      }

      const searches = await getRouteSearches(5);

      expect(searches).toHaveLength(5);
    });

    it("should order searches by searchedAt (newest first)", async () => {
      const timestamp1 = 1000;
      const timestamp2 = 2000;
      await addRouteSearch(
        "stop1",
        "stop2",
        "First From",
        "First To",
        timestamp1
      );
      await addRouteSearch(
        "stop3",
        "stop4",
        "Second From",
        "Second To",
        timestamp2
      );

      const searches = await getRouteSearches();

      expect(searches[0].fromStopName).toBe("Second From");
      expect(searches[1].fromStopName).toBe("First From");
    });

    it("should clear all route searches", async () => {
      await addRouteSearch("stop1", "stop2", "東駅", "中央公園");
      await addRouteSearch("stop3", "stop4", "西口", "大学病院");

      let searches = await getRouteSearches();
      expect(searches).toHaveLength(2);

      await clearRouteSearches();
      searches = await getRouteSearches();
      expect(searches).toHaveLength(0);
    });

    it("should store all required fields", async () => {
      await addRouteSearch("stop1", "stop2", "東駅", "中央公園");

      const searches = await getRouteSearches();
      const search = searches[0] as RouteSearchRecord;

      expect(search.id).toBeDefined();
      expect(search.fromStopId).toBe("stop1");
      expect(search.toStopId).toBe("stop2");
      expect(search.fromStopName).toBe("東駅");
      expect(search.toStopName).toBe("中央公園");
      expect(search.searchedAt).toBeDefined();
      expect(typeof search.searchedAt).toBe("number");
    });
  });

  describe("Isolation between stores", () => {
    it("should keep bus stop and route searches separate", async () => {
      await addBusStopSearch("stop1", "中央公園", "徒歩2分");
      await addRouteSearch("stop2", "stop3", "東駅", "西口");

      const busStopSearches = await getBusStopSearches();
      const routeSearches = await getRouteSearches();

      expect(busStopSearches).toHaveLength(1);
      expect(routeSearches).toHaveLength(1);

      await clearBusStopSearches();

      const busStopSearchesAfter = await getBusStopSearches();
      const routeSearchesAfter = await getRouteSearches();

      expect(busStopSearchesAfter).toHaveLength(0);
      expect(routeSearchesAfter).toHaveLength(1);
    });
  });
});
