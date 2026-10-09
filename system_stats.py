"""Read-only host figures for the dashboard's System card.

Standard library only. Linux reads /proc; every other platform reports
``available: false`` rather than guessing. Nothing here touches observed
sessions, usage, or progression.
"""
from __future__ import annotations

import os
import shutil
import sys
import threading
import time
from pathlib import Path
from typing import Any, Optional

_lock = threading.Lock()
_previous: Optional[tuple[float, int, int]] = None  # (monotonic, busy, total)
_MIN_INTERVAL = 0.5


def _cpu_times(proc: Path) -> tuple[int, int]:
    """Return (busy, total) jiffies from the aggregate ``cpu`` line."""
    with open(proc / "stat", encoding="ascii") as handle:
        fields = handle.readline().split()
    if not fields or fields[0] != "cpu":
        raise ValueError("unexpected /proc/stat")
    values = [int(value) for value in fields[1:9]]
    idle = values[3] + (values[4] if len(values) > 4 else 0)
    total = sum(values)
    return total - idle, total


def _cpu_percent(proc: Path) -> Optional[float]:
    """Utilization since the previous request; unknown on the first reading."""
    global _previous
    busy, total = _cpu_times(proc)
    now = time.monotonic()
    with _lock:
        before = _previous
        if before is None or now - before[0] >= _MIN_INTERVAL:
            _previous = (now, busy, total)
    if before is None or total <= before[2]:
        return None
    return round(100.0 * (busy - before[1]) / (total - before[2]), 1)


def _memory(proc: Path) -> dict[str, int]:
    found: dict[str, int] = {}
    with open(proc / "meminfo", encoding="ascii") as handle:
        for line in handle:
            key, _, rest = line.partition(":")
            if key in ("MemTotal", "MemAvailable"):
                found[key] = int(rest.split()[0]) * 1024
    if "MemTotal" not in found or "MemAvailable" not in found:
        raise ValueError("incomplete /proc/meminfo")
    return {
        "used_bytes": max(0, found["MemTotal"] - found["MemAvailable"]),
        "total_bytes": found["MemTotal"],
    }


def read(directory: Path, proc: Path = Path("/proc")) -> dict[str, Any]:
    """Current host figures, or ``{"available": False}`` when unreadable."""
    if not sys.platform.startswith("linux"):
        return {"available": False, "platform": sys.platform}
    try:
        target = directory if directory.exists() else Path.home()
        usage = shutil.disk_usage(target)
        return {
            "available": True,
            "platform": "linux",
            "cpu_percent": _cpu_percent(proc),
            "load_1m": round(os.getloadavg()[0], 2),
            "memory": _memory(proc),
            "disk": {
                "used_bytes": usage.used,
                "total_bytes": usage.total,
                "scope": "office data directory",
            },
        }
    except (OSError, ValueError, KeyError):
        return {"available": False, "platform": "linux"}
