"""Scrape news articles from official group sites and store in Supabase."""

import urllib.request
import urllib.error
import urllib.parse
import json
import re
import sys

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


def news_exists(group_id, url):
    encoded = urllib.parse.quote(url)
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/news?select=id&group_id=eq.{group_id}&url=eq.{encoded}",
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


def insert_news(item):
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/news",
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
            print(f"  [ERROR] News table does not exist. Run migration: supabase/migrations/002_news_schedules.sql")
            return 0, "Table not found"
        return e.code, body


def parse_news_list(html, base_url):
    """Extract news articles from the HTML. Handles all three group site formats."""
    articles = []

    # Find the news list section - try multiple class names
    list_match = re.search(
        r'<ul[^>]*class="[^"]*(?:infoList|list--information)[^"]*"[^>]*>(.*?)</ul>',
        html,
        re.DOTALL,
    )
    if not list_match:
        return articles

    list_html = list_match.group(1)
    # Match <li> items (with optional attributes like class="inview")
    items = re.findall(r"<li[^>]*>(.*?)</li>", list_html, re.DOTALL)

    for item in items:
        # Extract URL
        url_match = re.search(r'<a\s+href="([^"]*)"', item)
        if not url_match:
            continue
        url = url_match.group(1)
        if not url.startswith("http"):
            url = base_url.rstrip("/") + url

        # Extract title - same class name across all formats
        title_match = re.search(
            r'<p[^>]*class="[^"]*tit[^"]*"[^>]*>(.*?)</p>', item, re.DOTALL
        )
        if not title_match:
            continue
        title = re.sub(r"<[^>]+>", "", title_match.group(1)).strip()

        # Extract date - all formats use YYYY.MM.DD somewhere
        date_match = re.search(r"(\d{4}\.\d{2}\.\d{2})", item)
        if not date_match:
            continue
        date_str = date_match.group(1).replace(".", "-")

        # Extract category - try multiple patterns
        category = None
        # =LOVE/≠ME: <span class="catN">cat_name</span>
        cat_match = re.search(r'<span[^>]*class="[^"]*cat\d+[^"]*"[^>]*>(.*?)</span>', item)
        if cat_match:
            category = cat_match.group(1).strip()
        # ≒JOY: <p class="category catN">cat_name</p>
        if not category:
            cat_match = re.search(
                r'<p[^>]*class="[^"]*category[^"]*"[^>]*>(.*?)</p>', item
            )
            if cat_match:
                category = cat_match.group(1).strip()

        # Extract image URL
        img_url = None
        # Try <img> tag
        img_match = re.search(r'<img\s+[^>]*src="([^"]*)"', item)
        if img_match:
            src = img_match.group(1)
            if not src.startswith("http"):
                src = base_url.rstrip("/") + src
            if "dummy" not in src.lower() and "thumb_blank" not in src.lower():
                img_url = src
        # Try background-image style
        if not img_url:
            bg_match = re.search(r"background-image:\s*url\(([^)]+)\)", item)
            if bg_match:
                bg_url = bg_match.group(1)
                if "thumb_blank" not in bg_url.lower():
                    img_url = bg_url

        articles.append(
            {
                "title": title,
                "date": date_str,
                "category": category,
                "url": url,
                "image_url": img_url,
            }
        )

    return articles


# Group configurations
groups_config = {
    "equal-love": {
        "url": "https://equal-love.jp/news/",
        "name": "=LOVE",
        "pageParam": "?page=",
        "baseUrl": "https://equal-love.jp",
    },
    "not-equal-me": {
        "url": "https://not-equal-me.jp/news/1",
        "name": "!=ME",
        "pageParam": "/?page=",
        "baseUrl": "https://not-equal-me.jp",
    },
    "nearly-equal-joy": {
        "url": "https://nearly-equal-joy.jp/news/1",
        "name": "!=JOY",
        "pageParam": "/?page=",
        "baseUrl": "https://nearly-equal-joy.jp",
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

    # Scrape pages 1 and 2 to cover enough articles
    all_articles = []
    for page in [1, 2]:
        page_param = cfg.get("pageParam", "?page=")
        url = cfg["url"] if page == 1 else f"{cfg['url']}{page_param}{page}"
        print(f"  Fetching page {page}: {url}")
        html = fetch_page(url)
        if not html:
            continue
        articles = parse_news_list(html, cfg["baseUrl"])
        print(f"    Found {len(articles)} articles")
        all_articles.extend(articles)

    # Deduplicate by URL within this run
    seen = set()
    unique = []
    for a in all_articles:
        if a["url"] not in seen:
            seen.add(a["url"])
            unique.append(a)
    all_articles = unique

    inserted = 0
    for a in all_articles:
        if news_exists(group_id, a["url"]):
            total_skipped += 1
            continue
        status, err = insert_news(
            {
                "group_id": group_id,
                "title": a["title"],
                "date": a["date"],
                "category": a["category"],
                "url": a["url"],
                "image_url": a["image_url"],
            }
        )
        if status in (200, 201, 204):
            inserted += 1
        else:
            print(f"    [FAIL] {a['title'][:50]}... HTTP {status}: {err}")

    total_inserted += inserted
    print(f"  Inserted: {inserted}, Skipped: {len(all_articles) - inserted}")

print(f"\n=== Scrape complete: {total_inserted} inserted, {total_skipped} skipped ===")
