"""Import recent videos from YouTube channels into Supabase.

Skips duplicates by checking existing youtube_url before inserting.
"""
import urllib.request
import urllib.error
import urllib.parse
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

YOUTUBE_KEY = "AIzaSyCjO23YQYqb8uIHMb6YyKUfuagtmJ_QZKs"
SUPABASE_URL = "https://rjnkeitizvwbhgeveyeu.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqbmtlaXRpenZ3YmhnZXZleWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzE4NjgsImV4cCI6MjA5NDUwNzg2OH0.9j4WAE5OW1epYukYymiNIFYxb6tmwrGTNTbDt4iL2FE"

WRITE_HEADERS = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}
READ_HEADERS = {"apikey": ANON_KEY}


def youtube_api(path, params=None):
    url = f"https://www.googleapis.com/youtube/v3/{path}?key={YOUTUBE_KEY}"
    if params:
        for k, v in params.items():
            url += f"&{k}={urllib.parse.quote(str(v))}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def supabase_get(path):
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{path}", headers=READ_HEADERS)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def supabase_post(path, data):
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{path}",
        data=json.dumps(data).encode(),
        headers=WRITE_HEADERS,
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, None
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def video_exists(youtube_url):
    """Check if a video with this youtube_url already exists in the database."""
    encoded = urllib.parse.quote(youtube_url)
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/videos?select=id&youtube_url=eq.{encoded}",
        headers=READ_HEADERS,
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read())
        return len(data) > 0


# Map YouTube handles to group slugs
channels = {
    "@equallove_": "equal-love",
    "@notequalme6632": "not-equal-me",
    "@nearlyequaljoy5843": "nearly-equal-joy",
    "@ikonoijoy": None,  # combined channel, link to all groups
}

# Get group IDs
groups = {g["slug"]: g["id"] for g in supabase_get("groups")}
print(f"Groups: {groups}")

total_inserted = 0
total_skipped = 0
total_errors = 0

for handle, slug in channels.items():
    print(f"\n=== {handle} ===")
    group_id = groups.get(slug) if slug else None

    try:
        # Get channel by handle
        channels_info = youtube_api("channels", {
            "part": "contentDetails,snippet",
            "forHandle": handle.lstrip("@"),
        })
    except Exception as e:
        print(f"  ERROR getting channel info: {e}")
        total_errors += 1
        continue

    if not channels_info.get("items"):
        print(f"  Channel not found for {handle}")
        continue

    channel = channels_info["items"][0]
    title = channel["snippet"]["title"]
    uploads_id = channel["contentDetails"]["relatedPlaylists"]["uploads"]
    print(f"  Title: {title}")

    # Get recent videos (last 10)
    try:
        playlist = youtube_api("playlistItems", {
            "part": "snippet",
            "playlistId": uploads_id,
            "maxResults": 10,
        })
    except Exception as e:
        print(f"  ERROR getting playlist: {e}")
        total_errors += 1
        continue

    inserted = 0
    skipped = 0

    for item in playlist.get("items", []):
        snippet = item["snippet"]
        video_id = snippet["resourceId"]["videoId"]
        video_title = snippet["title"]
        thumbnail = (
            snippet.get("thumbnails", {}).get("high", {}).get("url")
            or snippet.get("thumbnails", {}).get("medium", {}).get("url")
            or snippet.get("thumbnails", {}).get("default", {}).get("url", "")
        )
        youtube_url = f"https://www.youtube.com/watch?v={video_id}"

        if video_exists(youtube_url):
            skipped += 1
            continue

        video_data = {
            "group_id": group_id,
            "title_ja": video_title,
            "thumbnail_url": thumbnail,
            "youtube_url": youtube_url,
            "sort_order": inserted,
        }
        status, err = supabase_post("videos", video_data)
        if status == 201:
            print(f"  [OK] {video_title[:60]}")
            inserted += 1
        else:
            print(f"  [FAIL] {video_title[:60]}: {status}")
            total_errors += 1

    print(f"  Inserted {inserted}, skipped {skipped} duplicates for {title}")
    total_inserted += inserted
    total_skipped += skipped

print(f"\n=== Summary: {total_inserted} new, {total_skipped} skipped, {total_errors} errors ===")
