"""Update group name_cn to unified format: =LOVE（等爱）、≠ME（糯米）、≒JOY（近喜）"""
import urllib.request
import urllib.error
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://rjnkeitizvwbhgeveyeu.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqbmtlaXRpenZ3YmhnZXZleWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzE4NjgsImV4cCI6MjA5NDUwNzg2OH0.9j4WAE5OW1epYukYymiNIFYxb6tmwrGTNTbDt4iL2FE"

headers = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

name_updates = {
    "equal-love": "=LOVE（等爱）",
    "not-equal-me": "≠ME（糯米）",
    "nearly-equal-joy": "≒JOY（近喜）",
}

for slug, name_cn in name_updates.items():
    data = {"name_cn": name_cn}
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/groups?slug=eq.{slug}",
        data=json.dumps(data).encode(),
        headers=headers,
        method="PATCH",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
            print(f"[OK] {slug} → name_cn = '{name_cn}'")
    except urllib.error.HTTPError as e:
        print(f"[FAIL] {slug}: {e.code} {e.read().decode()}")

print("\nGroup name_cn update complete.")
