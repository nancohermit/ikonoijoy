"""Scrape group descriptions from official about pages and update Supabase."""
import urllib.request
import urllib.error
import json
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://rjnkeitizvwbhgeveyeu.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqbmtlaXRpenZ3YmhnZXZleWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzE4NjgsImV4cCI6MjA5NDUwNzg2OH0.9j4WAE5OW1epYukYymiNIFYxb6tmwrGTNTbDt4iL2FE"

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

def fetch_page(url):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read().decode('utf-8', errors='replace')
    except Exception as e:
        print(f"  Failed to fetch {url}: {e}")
        return None

def extract_paragraphs(html):
    """Extract text from <p> tags inside the main about section."""
    # Find the about section
    section_match = re.search(r'<section[^>]*id="about"[^>]*>(.*?)</section>', html, re.DOTALL)
    if not section_match:
        section_match = re.search(r'<section[^>]*class="[^"]*page--about[^"]*"[^>]*>(.*?)</section>', html, re.DOTALL)
    if not section_match:
        section_match = re.search(r'<section[^>]*class="[^"]*section--detail[^"]*"[^>]*>(.*?)</section>', html, re.DOTALL)

    if not section_match:
        return []

    section_html = section_match.group(1)

    # Remove message/quote blocks (producer quotes)
    section_html = re.sub(r'<p[^>]*class="[^"]*messeage[^"]*"[^>]*>.*?</p>', '', section_html, flags=re.DOTALL)

    # Extract <p> tag content
    paragraphs = re.findall(r'<p[^>]*>(.*?)</p>', section_html, re.DOTALL)
    result = []
    for p in paragraphs:
        # Strip HTML tags
        text = re.sub(r'<[^>]+>', '', p)
        # Strip &nbsp; etc
        text = text.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        if text and len(text) > 20:
            result.append(text)

    return result

def update_group(slug, description_ja):
    """PATCH group description in Supabase."""
    data = {"description_ja": description_ja}
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/groups?slug=eq.{slug}",
        data=json.dumps(data).encode(),
        headers={
            "apikey": ANON_KEY,
            "Authorization": f"Bearer {ANON_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
        method="PATCH",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, None
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

# Group configs
groups = {
    "equal-love": {
        "url": "https://equal-love.jp/feature/about",
        "name": "=LOVE",
    },
    "not-equal-me": {
        "url": "https://not-equal-me.jp/feature/about",
        "name": "≠ME",
    },
    "nearly-equal-joy": {
        "url": "https://nearly-equal-joy.jp/feature/about",
        "name": "≒JOY",
    },
}

print("=== Scraping group descriptions from official sites ===\n")

for slug, cfg in groups.items():
    print(f"--- {cfg['name']} ({slug}) ---")
    html = fetch_page(cfg["url"])
    if not html:
        continue

    paragraphs = extract_paragraphs(html)
    if paragraphs:
        description_ja = "\n\n".join(paragraphs)
        print(f"  Extracted {len(paragraphs)} paragraphs ({len(description_ja)} chars)")
        status, err = update_group(slug, description_ja)
        if status in (200, 204):
            print(f"  [OK] Updated description_ja")
        else:
            print(f"  [FAIL] HTTP {status}: {err}")
    else:
        print(f"  [SKIP] No paragraphs found")

print("\n=== Group descriptions scrape complete ===")
