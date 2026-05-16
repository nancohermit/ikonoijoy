import urllib.request, urllib.parse, json, sys
sys.stdout.reconfigure(encoding='utf-8')

KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqbmtlaXRpenZ3YmhnZXZleWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzE4NjgsImV4cCI6MjA5NDUwNzg2OH0.9j4WAE5OW1epYukYymiNIFYxb6tmwrGTNTbDt4iL2FE"
URL = "https://rjnkeitizvwbhgeveyeu.supabase.co/rest/v1"

# Find member ID
name = "音嶋 莉沙"
q = f"members?name_ja=eq.{urllib.parse.quote(name)}&select=id"
req = urllib.request.Request(f"{URL}/{q}", headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"})
with urllib.request.urlopen(req) as r:
    members = json.loads(r.read())
    member_id = members[0]['id']
    print(f"Found: {name} → {member_id}")

# Update
data = json.dumps({
    "birthday": "1998/8/11",
    "birthplace": "福岡県",
    "height": "160cm",
    "blood_type": "B型",
    "hobby_ja": "人間観察、コスメを集めること、食べ歩き",
}).encode()
req = urllib.request.Request(
    f"{URL}/members?id=eq.{member_id}",
    data=data,
    headers={"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json", "Prefer": "return=minimal"},
    method="PATCH",
)
with urllib.request.urlopen(req) as r:
    print(f"Status: {r.status} → updated!")
