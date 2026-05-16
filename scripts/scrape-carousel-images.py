"""Populate carousel_images table with main artist photos from official sites."""
import urllib.request
import urllib.error
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://rjnkeitizvwbhgeveyeu.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqbmtlaXRpenZ3YmhnZXZleWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzE4NjgsImV4cCI6MjA5NDUwNzg2OH0.9j4WAE5OW1epYukYymiNIFYxb6tmwrGTNTbDt4iL2FE"

HEADERS = {"apikey": ANON_KEY}
WRITE_HEADERS = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

def get_groups():
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/groups?select=id,slug,name_ja&order=sort_order", headers=HEADERS)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def clear_carousel(group_id):
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/carousel_images?group_id=eq.{group_id}",
        headers={"apikey": ANON_KEY, "Authorization": f"Bearer {ANON_KEY}"},
        method="DELETE",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return True
    except:
        return False

def insert_carousel(group_id, image_url, link_url, sort_order):
    data = {
        "group_id": group_id,
        "image_url": image_url,
        "link_url": link_url,
        "sort_order": sort_order,
    }
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/carousel_images",
        data=json.dumps(data).encode(),
        headers=WRITE_HEADERS,
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"    Error: {e.code} {e.read().decode()}")
        return None

# Main artist photos scraped from official sites (June 2026)
carousel_data = {
    "equal-love": {
        "site": "https://equal-love.jp",
        "images": [
            {
                "url": "https://equal-love.jp/static/equallove/official/artistph/ph_main202603_pc_Ju2TegVD.jpg",
                "link": "https://equal-love.jp/feature/profile",
                "sort": 1,
            },
        ],
    },
    "not-equal-me": {
        "site": "https://not-equal-me.jp",
        "images": [
            {
                "url": "https://not-equal-me.jp/static/notequalme/official/artistph/ME_11thSG_PC_oeiKemdn.jpg",
                "link": "https://not-equal-me.jp/feature/profile",
                "sort": 1,
            },
        ],
    },
    "nearly-equal-joy": {
        "site": "https://nearly-equal-joy.jp",
        "images": [
            {
                "url": "https://nearly-equal-joy.jp/static/yoani3rd/official/artistph/ph_main_202602_pc_IueY2HhD.jpg",
                "link": "https://nearly-equal-joy.jp/feature/profile",
                "sort": 1,
            },
        ],
    },
}

print("=== Populating carousel_images from official artist photos ===\n")

groups = get_groups()
for g in groups:
    slug = g["slug"]
    if slug not in carousel_data:
        continue
    cfg = carousel_data[slug]
    print(f"--- {g['name_ja']} ({slug}) ---")
    clear_carousel(g["id"])
    print(f"  Cleared old carousel entries")
    for img in cfg["images"]:
        result = insert_carousel(g["id"], img["url"], img["link"], img["sort"])
        if result:
            print(f"  [OK] Inserted: {img['url'].split('/')[-1][:50]}")
        else:
            print(f"  [FAIL] {img['url']}")

print("\n=== Carousel images populated ===")
