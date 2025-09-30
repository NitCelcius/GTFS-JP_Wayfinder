"""A small thread-safe TTL + LRU cache used by the API.

Features:
- Thread-safe via a lock
- TTL (time-to-live) per item
- Simple LRU eviction when max_items is reached (uses OrderedDict)
- Utility methods: get, set, get_or_set, delete, clear, __contains__, __len__

This is intentionally lightweight; for heavy production needs prefer a battle-
tested library such as `cachetools.TTLCache`.
"""

import threading
import time
from collections import OrderedDict
from collections.abc import Callable
from typing import Any


class TTLCache:
    def __init__(self, ttl_seconds: int = 10, max_items: int = 1000):
        self.ttl = float(ttl_seconds)
        self.max_items = int(max_items)
        # OrderedDict preserves insertion/access order; maps key -> (ts, value)
        self._store: OrderedDict[str, tuple[float, Any]] = OrderedDict()
        self._lock = threading.RLock()

    def _purge_expired_nolock(self) -> None:
        """Remove expired items. Caller must hold the lock."""
        now = time.time()
        remove_keys = []
        for k, (ts, _) in list(self._store.items()):
            if now - ts > self.ttl:
                remove_keys.append(k)
        for k in remove_keys:
            self._store.pop(k, None)

    def get(self, key: str) -> Any | None:
        with self._lock:
            self._purge_expired_nolock()
            val = self._store.get(key)
            if val is None:
                return None
            _ts, data = val  # _ts retained for potential future TTL logic (RUF059)
            # move to end to mark as recently used
            self._store.move_to_end(key)
            return data

    def set(self, key: str, value: Any) -> None:
        with self._lock:
            self._purge_expired_nolock()
            if key in self._store:
                # overwrite and mark used
                self._store.pop(key, None)
            elif len(self._store) >= self.max_items:
                # evict the least-recently-used (first) item
                from contextlib import suppress

                with suppress(Exception):
                    self._store.popitem(last=False)
            self._store[key] = (time.time(), value)

    def get_or_set(self, key: str, factory: Callable[[], Any]) -> Any:
        """Return the existing value for key or set it using factory()."""
        with self._lock:
            val = self.get(key)
            if val is not None:
                return val
            value = factory()
            self.set(key, value)
            return value

    def delete(self, key: str) -> None:
        with self._lock:
            self._store.pop(key, None)

    def clear(self) -> None:
        with self._lock:
            self._store.clear()

    def __contains__(self, key: str) -> bool:
        with self._lock:
            self._purge_expired_nolock()
            return key in self._store

    def __len__(self) -> int:
        with self._lock:
            self._purge_expired_nolock()
            return len(self._store)
