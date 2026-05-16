"""Translate official Japanese group descriptions to Chinese and update Supabase."""
import urllib.request
import urllib.error
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://rjnkeitizvwbhgeveyeu.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqbmtlaXRpenZ3YmhnZXZleWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzE4NjgsImV4cCI6MjA5NDUwNzg2OH0.9j4WAE5OW1epYukYymiNIFYxb6tmwrGTNTbDt4iL2FE"

# Chinese translations based on official Japanese descriptions scraped from official sites
translations = {
    "equal-love": (
        "指原莉乃制作的全新偶像企划「=LOVE（等爱）」正式启动。\n\n"
        "指原莉乃为了制作自己理想中的偶像，与拥有业界顶尖历史与实绩的声优学校——代代木动画学院合作，"
        "实施了融入「声优教育」的全新「声优偶像」初期成员选拔试镜。\n\n"
        "同年4月29日，试镜最终审查举行，制作人指原莉乃亲自宣布组合名为「=LOVE（等爱）」。\n\n"
        "「=LOVE（等爱）」这个名字蕴含着「偶像必须被粉丝所爱，而偶像这份工作也必须由自己去热爱」的理念。"
    ),
    "not-equal-me": (
        "「≠ME（不等我）」正式启动。\n\n"
        "指原莉乃为了制作自己理想中的偶像，与代代木动画学院合作结成的「=LOVE（等爱）」的姐妹组合诞生。\n\n"
        "2019年1月26日，试镜最终审查举行，2019年2月24日，在成员亮相的同时，"
        "制作人指原莉乃亲自宣布组合名为「≠ME（不等我）」。\n\n"
        "「≠ME（不等我）」这个名字蕴含着指原莉乃的愿望：「希望大家能体验到与以往不同的自己」。"
    ),
    "nearly-equal-joy": (
        "「≒JOY」（约等于快乐）正式启动。\n\n"
        "指原莉乃为了制作自己理想中的偶像，与代代木动画学院合作，继「=LOVE（等爱）」、「≠ME（不等我）」之后，"
        "第三个组合诞生。\n\n"
        "2022年1月30日，试镜最终审查举行，2022年3月29日，在成员亮相的同时，"
        "制作人指原莉乃亲自宣布组合名为「≒JOY」。\n\n"
        "「≒JOY」这个名字蕴含着指原莉乃的愿望：「希望成员与支持她们的粉丝们相遇时，"
        "能够感受到喜悦，获得幸福的心情」。"
    ),
}

headers = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

for slug, description_cn in translations.items():
    data = {"description_cn": description_cn}
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/groups?slug=eq.{slug}",
        data=json.dumps(data).encode(),
        headers=headers,
        method="PATCH",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"[OK] {slug} description_cn updated")
    except urllib.error.HTTPError as e:
        print(f"[FAIL] {slug}: {e.code} {e.read().decode()}")

print("\nTranslations complete.")
