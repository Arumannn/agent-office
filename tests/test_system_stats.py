from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
import system_stats  # noqa: E402


def _proc(tmp_path: Path, busy: int, idle: int) -> Path:
    (tmp_path / "stat").write_text(f"cpu  {busy} 0 0 {idle} 0 0 0 0 0 0\ncpu0 1 0 0 1 0 0 0 0 0 0\n")
    (tmp_path / "meminfo").write_text("MemTotal:       8000000 kB\nMemFree: 1 kB\nMemAvailable:   2000000 kB\n")
    return tmp_path


def test_non_linux_reports_unavailable_without_numbers(monkeypatch, tmp_path):
    monkeypatch.setattr(system_stats.sys, "platform", "darwin")
    assert system_stats.read(tmp_path) == {"available": False, "platform": "darwin"}


def test_linux_figures_come_from_proc_and_first_cpu_reading_is_unknown(monkeypatch, tmp_path):
    monkeypatch.setattr(system_stats.sys, "platform", "linux")
    monkeypatch.setattr(system_stats, "_previous", None)
    (tmp_path / "proc").mkdir()
    proc = _proc(tmp_path / "proc", 100, 900)
    first = system_stats.read(tmp_path, proc)
    assert first["available"] is True
    assert first["cpu_percent"] is None  # no earlier sample: never invented
    assert first["memory"] == {"used_bytes": 6000000 * 1024, "total_bytes": 8000000 * 1024}
    assert first["disk"]["total_bytes"] > 0 and first["disk"]["used_bytes"] >= 0
    # An earlier sample 100 busy / 900 idle, then 200 busy more over 1000 jiffies.
    monkeypatch.setattr(system_stats, "_MIN_INTERVAL", 0.0)
    _proc(proc, 300, 1700)
    second = system_stats.read(tmp_path, proc)
    assert second["cpu_percent"] == 20.0


def test_unreadable_proc_is_unavailable(monkeypatch, tmp_path):
    monkeypatch.setattr(system_stats.sys, "platform", "linux")
    assert system_stats.read(tmp_path, tmp_path / "missing")["available"] is False
