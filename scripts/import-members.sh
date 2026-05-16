#!/bin/bash
# Extract member data from official sites and insert into Supabase

SUPABASE_URL="https://rjnkeitizvwbhgeveyeu.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqbmtlaXRpenZ3YmhnZXZleWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzE4NjgsImV4cCI6MjA5NDUwNzg2OH0.9j4WAE5OW1epYukYymiNIFYxb6tmwrGTNTbDt4iL2FE"

# First, get group IDs
echo "Fetching group IDs..."
GROUPS=$(curl -sf "${SUPABASE_URL}/rest/v1/groups" -H "apikey: ${ANON_KEY}" -H "Authorization: Bearer ${ANON_KEY}")
EQUAL_LOVE_ID=$(echo "$GROUPS" | grep -oP '"id":"[^"]*"(?=.*?"slug":"equal-love")' | grep -oP '[a-f0-9-]{36}' | head -1)
NOT_EQUAL_ME_ID=$(echo "$GROUPS" | grep -oP '"id":"[^"]*"(?=.*?"slug":"not-equal-me")' | grep -oP '[a-f0-9-]{36}' | head -1)
NEARLY_EQUAL_JOY_ID=$(echo "$GROUPS" | grep -oP '"id":"[^"]*"(?=.*?"slug":"nearly-equal-joy")' | grep -oP '[a-f0-9-]{36}' | head -1)

echo "Group IDs:"
echo "  =LOVE: ${EQUAL_LOVE_ID}"
echo "  ≠ME: ${NOT_EQUAL_ME_ID}"
echo "  ≒JOY: ${NEARLY_EQUAL_JOY_ID}"

# =LOVE members
echo "=== =LOVE Members ==="
curl -sf "https://equal-love.jp/feature/profile" | grep -oP '<p class="name">[^<]*<span[^>]*>[^<]*</span></p>' |
while read line; do
  name_ja=$(echo "$line" | sed 's/<p class="name">//' | sed 's/<span.*//' | xargs | sed 's/ //g')
  name_en=$(echo "$line" | grep -oP '(?<=<span class="yomi">)[^<]*' | tr '[:upper:]' '[:lower:]' | sed 's/ /_/g')
  echo "  $name_ja ($name_en)"
done

# =LOVE profile images
echo "=== =LOVE Images ==="
curl -sf "https://equal-love.jp/feature/profile" | grep -oP "background-image:url\(https://equal-love\.jp/image/profile/[^)]*\)" |
while read line; do
  img=$(echo "$line" | sed 's/background-image:url(//' | sed 's/)//')
  echo "  $img"
done
