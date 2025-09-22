import time
from typing import Any, Optional


class TTLCache:
    def __init__(self, ttl_seconds: int = 10, max_items: int = 1000):
        self.ttl = ttl_seconds
        self.max_items = max_items
        self._store: dict[str, tuple[float, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        val = self._store.get(key)
        if not val:
            return None
        ts, data = val
        if time.time() - ts > self.ttl:
            del self._store[key]
            return None
        return data

    def set(self, key: str, value: Any):
        if len(self._store) >= self.max_items:
            # simple eviction: remove oldest
            oldest = min(self._store.items(), key=lambda kv: kv[1][0])[0]
            del self._store[oldest]
        self._store[key] = (time.time(), value)
