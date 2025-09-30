import time
import threading

from gtfs_jp_wayfinder.utils.cache import TTLCache


def test_ttl_expiry():
    c = TTLCache(ttl_seconds=0.1, max_items=10)
    c.set("a", 1)
    assert "a" in c
    time.sleep(0.15)
    # expired
    assert "a" not in c
    assert c.get("a") is None


def test_lru_eviction():
    c = TTLCache(ttl_seconds=10, max_items=2)
    c.set("a", 1)
    c.set("b", 2)
    # access 'a' so order is b(oldest), a(newest)
    _ = c.get("a")
    c.set("c", 3)
    # 'b' should be evicted as LRU
    assert "b" not in c
    assert c.get("a") == 1
    assert c.get("c") == 3


def test_get_or_set_factory_called_once():
    c = TTLCache(ttl_seconds=10, max_items=10)
    calls = []

    def factory():
        calls.append(1)
        return 99

    v1 = c.get_or_set("x", factory)
    v2 = c.get_or_set("x", factory)
    assert v1 == 99 and v2 == 99
    assert len(calls) == 1


def test_delete_and_clear():
    c = TTLCache(ttl_seconds=10, max_items=10)
    c.set("a", 1)
    c.set("b", 2)
    c.delete("a")
    assert "a" not in c
    c.clear()
    assert len(c) == 0


def test_thread_safety():
    c = TTLCache(ttl_seconds=10, max_items=1000)

    def worker(start):
        for i in range(start, start + 50):
            c.set(str(i), i)
            v = c.get(str(i))
            assert v == i

    threads = [threading.Thread(target=worker, args=(i * 50,)) for i in range(4)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    # check some values exist
    assert c.get("0") == 0
    assert c.get("199") == 199
