#!/usr/bin/env python3
"""Refresh the Google Scholar figures shown on the site.

Reads the citation / h-index / i10-index totals from the public Scholar
profile, stores them in data/scholar.json, and writes them into the
`data-scholar` spans in the HTML.

Design notes
------------
Scholar has no API and rate-limits datacentre IPs, so a failed fetch is the
normal case, not an exception. This script therefore never fails the build and
never overwrites good numbers with bad ones: if the fetch is blocked, or the
parsed values look implausible, it leaves the committed figures untouched and
exits 0. The page keeps showing the last verified numbers with the date they
were verified, which is honest either way.

Set SERPAPI_KEY in the environment (repository secret) to use SerpApi as a
fallback when the direct fetch is blocked. Without it the script still works;
it just succeeds less often.
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

SCHOLAR_ID = "Nj5PIzcAAAAJ"
ROOT = Path(__file__).resolve().parent.parent
STORE = ROOT / "data" / "scholar.json"
HTML_FILES = ["index.html", "publications.html"]

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
)

# A drop this large means we are almost certainly parsing a CAPTCHA page or a
# truncated response rather than a real correction to the record.
MAX_PLAUSIBLE_DROP = 0.15


def fetch_direct() -> str | None:
    url = (
        f"https://scholar.google.com/citations?user={SCHOLAR_ID}"
        "&hl=en&oi=ao&pagesize=100"
    )
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as exc:  # noqa: BLE001
        # Blocked, reset, throttled, DNS-failed: all of these mean the same
        # thing here, which is "keep the numbers we already have".
        print(f"direct fetch failed: {type(exc).__name__}: {exc}", file=sys.stderr)
        return None


def parse_html(html: str) -> dict[str, int] | None:
    """Pull the three totals out of the #gsc_rsb_st metrics table.

    Each row is `<td class="gsc_rsb_std">all</td><td ...>since</td>`; we want
    the first cell of each of the first three rows.
    """
    if "gsc_rsb_std" not in html:
        return None
    cells = re.findall(r'<td class="gsc_rsb_std">(\d+)</td>', html)
    if len(cells) < 6:
        return None
    return {
        "citations": int(cells[0]),
        "hindex": int(cells[2]),
        "i10": int(cells[4]),
    }


def fetch_serpapi(key: str) -> dict[str, int] | None:
    params = urllib.parse.urlencode(
        {"engine": "google_scholar_author", "author_id": SCHOLAR_ID, "api_key": key}
    )
    try:
        with urllib.request.urlopen(
            f"https://serpapi.com/search.json?{params}", timeout=30
        ) as resp:
            payload = json.load(resp)
    except Exception as exc:  # noqa: BLE001 - any failure means "no numbers"
        print(f"serpapi fetch failed: {exc}", file=sys.stderr)
        return None

    table = (payload.get("cited_by") or {}).get("table") or []
    flat: dict[str, int] = {}
    for row in table:
        for name, value in row.items():
            if isinstance(value, dict) and "all" in value:
                flat[name] = int(value["all"])
    if not {"citations", "h_index", "i10_index"} <= flat.keys():
        return None
    return {
        "citations": flat["citations"],
        "hindex": flat["h_index"],
        "i10": flat["i10_index"],
    }


def load_store() -> dict:
    if STORE.exists():
        return json.loads(STORE.read_text())
    return {}


def plausible(new: dict[str, int], old: dict) -> bool:
    if any(new[k] <= 0 for k in ("citations", "hindex", "i10")):
        print("rejected: non-positive value", file=sys.stderr)
        return False
    previous = old.get("citations")
    if isinstance(previous, int) and previous > 0:
        if new["citations"] < previous * (1 - MAX_PLAUSIBLE_DROP):
            print(
                f"rejected: citations fell {previous} -> {new['citations']}",
                file=sys.stderr,
            )
            return False
    return True


def write_html(values: dict) -> list[str]:
    """Replace the text inside every <tag data-scholar="key">…</tag>."""
    touched = []
    for name in HTML_FILES:
        path = ROOT / name
        if not path.exists():
            continue
        original = path.read_text()
        updated = original
        for key, value in values.items():
            pattern = re.compile(
                r'(<(\w+)([^>]*\sdata-scholar="%s"[^>]*)>)(.*?)(</\2>)' % re.escape(key),
                re.DOTALL,
            )
            updated = pattern.sub(
                lambda m, v=str(value): f"{m.group(1)}{v}{m.group(5)}", updated
            )
        if updated != original:
            path.write_text(updated)
            touched.append(name)
    return touched


def main() -> int:
    old = load_store()

    values = None
    html = fetch_direct()
    if html:
        values = parse_html(html)
        if values is None:
            print("direct fetch returned no metrics table (blocked?)", file=sys.stderr)

    if values is None and os.environ.get("SERPAPI_KEY"):
        values = fetch_serpapi(os.environ["SERPAPI_KEY"])

    if values is None:
        print("no fresh figures; keeping the committed ones")
        return 0

    if not plausible(values, old):
        print("fresh figures look wrong; keeping the committed ones")
        return 0

    today = date.today()
    record = {
        **values,
        "updated": today.isoformat(),
        "updated_human": f"{today.day} {today:%B %Y}",
        "profile": f"https://scholar.google.com/citations?user={SCHOLAR_ID}",
    }

    STORE.parent.mkdir(parents=True, exist_ok=True)
    STORE.write_text(json.dumps(record, indent=2) + "\n")

    touched = write_html({**values, "updated": record["updated_human"]})
    print(f"updated: {record}")
    print(f"html touched: {touched or 'none'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
