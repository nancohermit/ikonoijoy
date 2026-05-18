"""Scrape schedule events from official group sites and store in Supabase."""

import urllib.request
import urllib.error
import urllib.parse
import json
import re
import sys
from datetime import datetime

sys.stdout.reconfigure(encoding="utf-8")

SUPABASE_URL = "https://rjnkeitizvwbhgeveyeu.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqbmtlaXRpenZ3YmhnZXZleWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzE4NjgsImV4cCI6MjA5NDUwNzg2OH0.9j4WAE5OW1epYukYymiNIFYxb6tmwrGTNTbDt4iL2FE"

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
WRITE_HEADERS = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}
READ_HEADERS = {"apikey": ANON_KEY}


def fetch_page(url):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  Failed to fetch {url}: {e}")
        return None


def schedule_exists(group_id, url):
    if not url:
        return False
    encoded = urllib.parse.quote(url)
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/schedules?select=id&group_id=eq.{group_id}&url=eq.{encoded}",
        headers=READ_HEADERS,
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
            return len(data) > 0
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return False
        raise


def insert_schedule(item):
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/schedules",
        data=json.dumps(item).encode(),
        headers=WRITE_HEADERS,
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, None
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        if e.code == 404:
            print(f"  [ERROR] Schedules table does not exist. Run migration: supabase/migrations/002_news_schedules.sql")
            return 0, "Table not found"
        return e.code, body


def parse_schedule_calendar(html, base_url):
    """Extract schedule events from the calendar HTML."""
    events = []

    # Determine current year and month from the page
    now = datetime.now()
    year = now.year
    month = now.month

    # Try to find explicit month/year in the page
    month_match = re.search(
        r'(\d{4})\s*[/年]\s*(\d{1,2})\s*月', html
    )
    if month_match:
        year = int(month_match.group(1))
        month = int(month_match.group(2))

    # Find the calendar body
    cal_match = re.search(
        r'<div[^>]*class="[^"]*calendarBody[^"]*"[^>]*>(.*?)</div>\s*(?:</div>\s*)?(?:</div>\s*)?</div>\s*</div>',
        html,
        re.DOTALL,
    )
    if not cal_match:
        # Try simpler approach
        cal_match = re.search(
            r'<div[^>]*class="[^"]*calendar[^"]*"[^>]*>(.*?)</div>\s*</div>\s*</div>',
            html,
            re.DOTALL,
        )
    if not cal_match:
        print("    Could not find calendar body")
        return events

    cal_html = cal_match.group(1)

    # Find all cells with a date span
    cell_pattern = re.compile(
        r'<span[^>]*class="[^"]*date[^"]*"[^>]*>\s*(\d+)\s*</span>(.*?)(?=<div class="cell">|<div class="week">|</div>\s*</div>\s*$|</div>\s*<div class="week">)',
        re.DOTALL,
    )

    for cell_match in cell_pattern.finditer(cal_html):
        day = int(cell_match.group(1))
        cell_content = cell_match.group(2)

        # Extract events from this cell
        entry_pattern = re.compile(
            r'<a\s+href="([^"]*)"[^>]*>.*?<span[^>]*class="[^"]*cat[^"]*"[^>]*>\s*(.*?)\s*</span>.*?<span[^>]*class="[^"]*tit[^"]*"[^>]*>(.*?)</span>',
            re.DOTALL,
        )

        for entry_match in entry_pattern.finditer(cell_content):
            url = entry_match.group(1)
            if not url.startswith("http"):
                url = base_url.rstrip("/") + url

            category = entry_match.group(2).strip()
            title = re.sub(r"<[^>]+>", "", entry_match.group(3)).strip()

            date_str = f"{year:04d}-{month:02d}-{day:02d}"

            events.append(
                {
                    "title": title,
                    "date": date_str,
                    "category": category,
                    "url": url,
                }
            )

    return events


# Group configurations
groups_config = {
    "equal-love": {
        "url": "https://equal-love.jp/schedule/",
        "name": "=LOVE",
    },
    "not-equal-me": {
        "url": "https://not-equal-me.jp/schedule/",
        "name": "!=ME",
    },
    "nearly-equal-joy": {
        "url": "https://nearly-equal-joy.jp/schedule/",
        "name": "!=JOY",
    },
}

# Get group IDs from Supabase
print("=== Fetching group IDs ===\n")
req = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/groups?select=id,slug", headers=READ_HEADERS
)
with urllib.request.urlopen(req) as resp:
    groups_data = json.loads(resp.read())
group_map = {g["slug"]: g["id"] for g in groups_data}
print(f"Groups: {group_map}\n")

total_inserted = 0
total_skipped = 0

for slug, cfg in groups_config.items():
    group_id = group_map.get(slug)
    if not group_id:
        print(f"  [SKIP] No group ID for {slug}")
        continue

    print(f"--- {cfg['name']} ({slug}) ---")

    html = fetch_page(cfg["url"])
    if not html:
        continue

    events = parse_schedule_calendar(html, cfg["url"])
    print(f"  Found {len(events)} events")

    # Also try fetching next month to get events in the 7-day forward window
    next_month = datetime.now().month + 1
    next_year = datetime.now().year
    if next_month > 12:
        next_month = 1
        next_year += 1

    # Deduplicate by URL
    seen = set()
    unique = []
    for e in events:
        if e["url"] not in seen:
            seen.add(e["url"])
            unique.append(e)
    events = unique

    inserted = 0
    for e in events:
        if schedule_exists(group_id, e["url"]):
            total_skipped += 1
            continue
        status, err = insert_schedule(
            {
                "group_id": group_id,
                "title": e["title"],
                "date": e["date"],
                "category": e["category"],
                "url": e["url"],
            }
        )
        if status in (200, 201, 204):
            inserted += 1
        else:
            print(f"    [FAIL] {e['title'][:50]}... HTTP {status}: {err}")

    total_inserted += inserted
    print(f"  Inserted: {inserted}, Skipped: {len(events) - inserted}")

print(f"\n=== Scrape complete: {total_inserted} inserted, {total_skipped} skipped ===")
