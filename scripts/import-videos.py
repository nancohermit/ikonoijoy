"""Import recent videos from YouTube channels into Supabase."""
import urllib.request
import urllib.error
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

YOUTUBE_KEY = "AIzaSyCjO23YQYqb8uIHMb6YyKUfuagtmJ_QZKs"
SUPABASE_URL = "https://rjnkeitizvwbhgeveyeu.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqbmtlaXRpenZ3YmhnZXZleWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzE4NjgsImV4cCI6MjA5NDUwNzg2OH0.9j4WAE5OW1epYukYymiNIFYxb6tmwrGTNTbDt4iL2FE"

def youtube_api(path, params=None):
    url = f"https://www.googleapis.com/youtube/v3/{path}?key={YOUTUBE_KEY}"
    if params:
        for k, v in params.items():
            url += f"&{k}={urllib.parse.quote(str(v))}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def supabase_post(path, data):
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{path}",
        data=json.dumps(data).encode(),
        headers={"apikey": ANON_KEY, "Authorization": f"Bearer {ANON_KEY}",
                 "Content-Type": "application/json", "Prefer": "return=minimal"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, None
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

# Map YouTube handles to group slugs
channels = {
    "@equallove_": "equal-love",
    "@notequalme6632": "not-equal-me",
    "@nearlyequaljoy5843": "nearly-equal-joy",
    "@ikonoijoy": None,  # combined channel, link to all groups
}

# Get group IDs
groups_data = supabase_post("", None)  # just for headers
req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/groups", headers={"apikey": ANON_KEY})
with urllib.request.urlopen(req) as resp:
    groups = {g["slug"]: g["id"] for g in json.loads(resp.read())}

print(f"Groups: {groups}")

total = 0
for handle, slug in channels.items():
    print(f"\n=== {handle} ===")
    group_id = groups.get(slug) if slug else None

    # Get channel by handle
    channels_info = youtube_api("channels", {
        "part": "contentDetails,snippet",
        "forHandle": handle.lstrip("@"),
    })
    if not channels_info.get("items"):
        print(f"  Channel not found for {handle}")
        continue

    channel = channels_info["items"][0]
    title = channel["snippet"]["title"]
    uploads_id = channel["contentDetails"]["relatedPlaylists"]["uploads"]
    print(f"  Title: {title}")

    # Get recent videos (last 10)
    playlist = youtube_api("playlistItems", {
        "part": "snippet",
        "playlistId": uploads_id,
        "maxResults": 10,
    })

    count = 0
    for item in playlist.get("items", []):
        snippet = item["snippet"]
        video_id = snippet["resourceId"]["videoId"]
        video_title = snippet["title"]
        thumbnail = (
            snippet.get("thumbnails", {}).get("high", {}).get("url") or
            snippet.get("thumbnails", {}).get("medium", {}).get("url") or
            snippet.get("thumbnails", {}).get("default", {}).get("url", "")
        )
        youtube_url = f"https://www.youtube.com/watch?v={video_id}"

        video_data = {
            "group_id": group_id,
            "title_ja": video_title,
            "thumbnail_url": thumbnail,
            "youtube_url": youtube_url,
            "sort_order": count,
        }
        status, err = supabase_post("videos", video_data)
        if status == 201:
            print(f"  [OK] {video_title[:60]}")
            count += 1
            total += 1
        else:
            print(f"  [FAIL] {video_title[:60]}: {status}")

    print(f"  Imported {count} videos for {title}")

print(f"\nTotal videos imported: {total}")
