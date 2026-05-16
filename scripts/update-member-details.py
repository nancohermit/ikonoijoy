"""Scrape member detail info from official profile pages and update Supabase."""
import urllib.request
import urllib.error
import json
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://rjnkeitizvwbhgeveyeu.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqbmtlaXRpenZ3YmhnZXZleWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzE4NjgsImV4cCI6MjA5NDUwNzg2OH0.9j4WAE5OW1epYukYymiNIFYxb6tmwrGTNTbDt4iL2FE"

def get_members():
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/members?select=id,name_ja,name_en,group_id,groups(slug)", headers={"apikey": ANON_KEY})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def patch_member(member_id, data):
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/members?id=eq.{member_id}",
        data=json.dumps(data).encode(),
        headers={"apikey": ANON_KEY, "Authorization": f"Bearer {ANON_KEY}",
                 "Content-Type": "application/json", "Prefer": "return=minimal"},
        method="PATCH",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, None
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

def scrape_profile(url):
    """Scrape a profile page for detail fields."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='replace')
    except Exception as e:
        print(f"    Failed to fetch: {e}")
        return {}

    # Parse dt/dd pairs
    pairs = re.findall(r'<dt>([^<]*)</dt>\s*<dd>([^<]*)</dd>', html)
    result = {}
    for label, value in pairs:
        val = value.strip()
        if not val or val == '-':
            continue
        if '誕生日' in label:
            result['birthday'] = val
        elif '出身地' in label:
            result['birthplace'] = val
        elif '身長' in label:
            result['height'] = val
        elif '血液型' in label:
            result['blood_type'] = val
        elif '趣味' in label:
            result['hobby_ja'] = val
    return result

# Map member names to profile URL slugs
def get_profile_slugs(site, group_slug):
    """Fetch the profile listing page and extract member detail URLs."""
    url = f"https://{site}/feature/profile"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8', errors='replace')
    except Exception as e:
        print(f"  Failed to fetch profile list: {e}")
        return {}

    # Find profile links: /feature/slug_name or /feature/profile/slug_name
    links = re.findall(r'href="(/feature/(?:profile/)?([^"]+))"', html)
    slugs = {}
    for full_path, slug in links:
        # Filter: keep only member-specific slugs (not categories, not #)
        if slug and not slug.startswith('#') and not slug.startswith('?') and slug not in ('profile',):
            # Map by last part of slug (name_key)
            name_key = slug.split('/')[-1]
            slugs[name_key] = f"https://{site}{full_path}"
    return slugs

# Main
members = get_members()
# Group members by their group slug
groups = {}
for m in members:
    slug = m.get('groups', {}).get('slug', 'unknown') if m.get('groups') else 'unknown'
    if slug not in groups:
        groups[slug] = []
    groups[slug].append(m)

print(f"Found {len(members)} members across {len(groups)} groups\n")

site_map = {
    'equal-love': 'equal-love.jp',
    'not-equal-me': 'not-equal-me.jp',
    'nearly-equal-joy': 'nearly-equal-joy.jp',
}

# For =LOVE and ≠ME: profile URLs are /feature/NAME_KEY
# For ≒JOY: they might be different. Let's try common patterns.

total_updated = 0
for group_slug, site in site_map.items():
    if group_slug not in groups:
        continue
    print(f"=== {group_slug} ({site}) ===")
    profile_slugs = get_profile_slugs(site, group_slug)
    if not profile_slugs:
        print(f"  No profile URLs found, trying direct slug matching...")
        # Fall back to trying known name patterns
    else:
        print(f"  Found {len(profile_slugs)} profile links")

    for member in groups[group_slug]:
        name_en = member.get('name_en', '')
        profile_url = None

        # Try to find the profile URL from the scraped links
        if profile_slugs:
            en_lower = name_en.lower()
            # Try matching by English name parts
            for slug, url in profile_slugs.items():
                parts = en_lower.replace(' ', '_').split('_')
                if all(p in slug.lower() for p in parts if len(p) > 1):
                    profile_url = url
                    break
            # If not found, try by last part of name_en
            if not profile_url:
                last_name = en_lower.split(' ')[-1] if ' ' in en_lower else en_lower
                for slug, url in profile_slugs.items():
                    if last_name in slug.lower() or slug.lower() in last_name:
                        profile_url = url
                        break

        if profile_url:
            details = scrape_profile(profile_url)
            if details:
                status, err = patch_member(member['id'], details)
                if status in (200, 204):
                    print(f"  [OK] {member['name_ja']}: {details}")
                    total_updated += 1
                else:
                    print(f"  [FAIL] {member['name_ja']}: {status}")
            else:
                print(f"  [SKIP] {member['name_ja']}: no detail data found")
        else:
            print(f"  [SKIP] {member['name_ja']}: could not find profile URL")

print(f"\nUpdated {total_updated}/{len(members)} members with detail data.")
