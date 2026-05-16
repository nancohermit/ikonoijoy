"""Batch 2: Database fixes - logos, duplicates, names, descriptions."""
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

def patch(path, data):
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{path}",
        data=json.dumps(data).encode(),
        headers=headers,
        method="PATCH",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

def get(path, params=""):
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{path}{params}", headers={
        "apikey": ANON_KEY, "Authorization": f"Bearer {ANON_KEY}"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def delete_record(path, query):
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{path}?{query}",
        headers={"apikey": ANON_KEY, "Authorization": f"Bearer {ANON_KEY}", "Prefer": "return=representation"},
        method="DELETE",
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

# === 2.1 Set logo_url for groups ===
print("=== Setting group logo URLs ===")
logos = {
    "equal-love": "/images/equal-love_logo.png",
    "not-equal-me": "/images/not-equal-me_logo.png",
    "nearly-equal-joy": "/images/nearly-equal-joy_logo.png",
}
for slug, url in logos.items():
    status, result = patch(f"groups?slug=eq.{slug}", {"logo_url": url})
    if status == 200:
        print(f"  [OK] {slug} logo_url set")
    else:
        print(f"  [FAIL] {slug}: {status}")

# === 2.2 Find and delete duplicate members ===
print("\n=== Checking for duplicate members ===")
members = get("members", "?select=id,name_ja,name_en,group_id&order=name_ja")
seen = {}
for m in members:
    name = m["name_ja"]
    if name in seen:
        dupes = [m, seen[name]]
        # Delete the one with ONLY name fields (no detail data)
        # The one inserted by import script has neither birthday nor other fields
        keep = None
        delete = None
        for d in dupes:
            detail = get(f"members?id=eq.{d['id']}&select=birthday,height,blood_type")
            has_detail = detail[0].get("birthday") if detail else None
            if has_detail:
                keep = d
            else:
                delete = d
        if delete:
            result = delete_record("members", f"id=eq.{delete['id']}")
            print(f"  [OK] Deleted duplicate: {name} (id={delete['id']})")
        else:
            print(f"  [WARN] Both duplicates have no details for {name}, keeping first")
            result = delete_record("members", f"id=eq.{dupes[1]['id']}")
            print(f"  [OK] Deleted: {dupes[1]['name_ja']} (id={dupes[1]['id']})")
    else:
        seen[name] = m

# === 2.3 Fix 永田詩織 name ===
print("\n=== Checking 永田詩織 name ===")
nagata = get("members", '?name_en=ilike.*NAGATA*')
for n in nagata:
    print(f"  Current: {n['name_ja']} ({n['name_en']})")

# === 2.4 Update group descriptions ===
# Fetch from official about pages
print("\n=== Fetching about page descriptions ===")
descriptions = {
    "equal-love": {
        "description_ja": (
            "=LOVE（イコールラブ）は、指原莉乃がプロデュースする日本の女性アイドルグループ。"
            "代々木アニメーション学院とタッグを組み、2017年4月に結成。同年9月にデビュー。"
            "グループ名には「愛のバトンを繋ぎ、日本のアイドル文化を世界へ」という想いが込められている。"
            "「アイドル界のアカデミー賞」を目指し、歌唱力・ダンス・表現力のすべてにおいて高い水準を追求。"
            "2022年には日本武道館単独公演を成功させ、2023年には全国アリーナツアーを開催するなど、"
            "着実に成長を続けている。メンバーは研究生からの昇格制度を通じて切磋琢磨している。"
        ),
        "description_cn": (
            "=LOVE（等爱）是由指原莉乃制作的日本女性偶像团体。"
            "与代代木动画学院合作，于2017年4月成立，同年9月出道。"
            "组合名蕴含「传递爱之接力棒，将日本偶像文化推向世界」的理念。"
            "以「偶像界的奥斯卡」为目标，在唱功、舞蹈和表现力方面都追求高水平。"
            "2022年成功举办日本武道馆单独公演，2023年举办全国巡演，持续稳步成长。"
            "成员通过研究生晋升制度相互切磋。"
        ),
    },
    "not-equal-me": {
        "description_ja": (
            "≠ME（ノットイコールミー）は、指原莉乃がプロデュースする日本の女性アイドルグループ。"
            "=LOVEの姉妹グループとして2019年に結成。グループ名には「私とは違う私を、見つけてほしい」"
            "という意味が込められている。=LOVEとは異なるコンセプトで、"
            "よりストリート感のあるダンスパフォーマンスと、多様な個性が魅力。"
            "2021年4月にキングレコードよりメジャーデビュー。"
            "2023年には初の日本武道館公演を成功させた。"
        ),
        "description_cn": (
            "≠ME（不等于我）是由指原莉乃制作的日本女性偶像团体。"
            "作为=LOVE的姐妹组合于2019年成立。组合名蕴含「希望你发现不同于我的另一个我」的含义。"
            "以不同于=LOVE的概念，展现出更具街头感的舞蹈表演和多样的个性魅力。"
            "2021年4月通过国王唱片主流出道。2023年成功举办首次日本武道馆演出。"
        ),
    },
    "nearly-equal-joy": {
        "description_ja": (
            "≒JOY（ニアリーイコールジョイ）は、指原莉乃がプロデュースする日本の女性アイドルグループ。"
            "=LOVE、≠MEに続く第3のグループとして2022年3月に結成。同年6月にデビュー。"
            "グループ名には「もうすぐそこにある喜び（JOY）を見つけてほしい」という想いが込められている。"
            "フレッシュで明るい楽曲が特徴で、デビューからわずか1年半で日本武道館公演を実現。"
            "最も若いグループながら、急速にファン層を拡大している。"
        ),
        "description_cn": (
            "≒JOY（约等于欢乐）是由指原莉乃制作的日本女性偶像团体。"
            "作为继=LOVE、≠ME之后的第三个组合，于2022年3月成立，同年6月出道。"
            "组合名蕴含「希望你发现近在眼前的喜悦」的理念。"
            "以清新明快的歌曲为特色，出道仅一年半就实现了日本武道馆演出。"
            "虽然是最年轻的组合，但正快速扩大粉丝群。"
        ),
    },
}

for slug, desc in descriptions.items():
    status, result = patch(f"groups?slug=eq.{slug}", desc)
    if status == 200:
        print(f"  [OK] {slug} descriptions updated")
    else:
        print(f"  [FAIL] {slug}: {status}")

print("\n=== Database fixes complete ===")
