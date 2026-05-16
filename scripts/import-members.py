"""Import all members from the three idol groups into Supabase."""
import urllib.request
import urllib.error
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://rjnkeitizvwbhgeveyeu.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqbmtlaXRpenZ3YmhnZXZleWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzE4NjgsImV4cCI6MjA5NDUwNzg2OH0.9j4WAE5OW1epYukYymiNIFYxb6tmwrGTNTbDt4iL2FE"

def api_get(path):
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{path}", headers={"apikey": ANON_KEY})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def api_post(path, data):
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

# Get group IDs
groups = {g["slug"]: g["id"] for g in api_get("groups")}
print(f"Group IDs: {groups}")

# =LOVE members
equal_love_members = [
    ("大谷 映美里", "OTANI EMIRI", "https://equal-love.jp/image/profile/otani_emiri.jpg"),
    ("大場 花菜", "OBA HANA", "https://equal-love.jp/image/profile/oba_hana.jpg"),
    ("音嶋 莉沙", "OTOSHIMA RISA", "https://equal-love.jp/image/profile/otoshima_risa.jpg"),
    ("齋藤 樹愛羅", "SAITO KIARA", "https://equal-love.jp/image/profile/saito_kiara.jpg"),
    ("佐々木 舞香", "SASAKI MAIKA", "https://equal-love.jp/image/profile/sasaki_maika.jpg"),
    ("髙松 瞳", "TAKAMATSU HITOMI", "https://equal-love.jp/image/profile/takamatsu_hitomi.jpg"),
    ("瀧脇 笙古", "TAKIWAKI SHOKO", "https://equal-love.jp/image/profile/takiwaki_shoko.jpg"),
    ("野口 衣織", "NOGUCHI IORI", "https://equal-love.jp/image/profile/noguchi_iori.jpg"),
    ("諸橋 沙夏", "MOROHASHI SANA", "https://equal-love.jp/image/profile/morohashi_sana.jpg"),
    ("山本 杏奈", "YAMAMOTO ANNA", "https://equal-love.jp/image/profile/yamamoto_anna.jpg"),
]

# ≠ME members
not_equal_me_members = [
    ("尾木 波菜", "OGI HANA", "https://not-equal-me.jp/image/profile/ogi_hana_thumb.jpg"),
    ("落合 希来里", "OCHIAI KIRARI", "https://not-equal-me.jp/image/profile/ochiai_kirari_thumb.jpg"),
    ("蟹沢 萌子", "KANISAWA MOEKO", "https://not-equal-me.jp/image/profile/kanisawa_moeko_thumb.jpg"),
    ("河口 夏音", "KAWAGUCHI NATSUNE", "https://not-equal-me.jp/image/profile/kawaguchi_natsune_thumb.jpg"),
    ("川中子 奈月心", "KAWANAGO NATSUMI", "https://not-equal-me.jp/image/profile/kawanago_natsumi_thumb.jpg"),
    ("櫻井 もも", "SAKURAI MOMO", "https://not-equal-me.jp/image/profile/sakurai_momo_thumb.jpg"),
    ("菅波 美玲", "SUGANAMI MIREI", "https://not-equal-me.jp/image/profile/suganami_mirei_thumb.jpg"),
    ("鈴木 瞳美", "SUZUKI HITOMI", "https://not-equal-me.jp/image/profile/suzuki_hitomi_thumb.jpg"),
    ("谷崎 早耶", "TANIZAKI SAYA", "https://not-equal-me.jp/image/profile/tanizaki_saya_thumb.jpg"),
    ("冨田 菜々風", "TOMITA NANAKA", "https://not-equal-me.jp/image/profile/tomita_nanaka_thumb.jpg"),
    ("永田 詩織", "NAGATA SHIORI", "https://not-equal-me.jp/image/profile/nagata_shiori_thumb.jpg"),
    ("本田 珠由記", "HONDA MIYUKI", "https://not-equal-me.jp/image/profile/honda_miyuki_thumb.jpg"),
]

# ≒JOY members
nearly_equal_joy_members = [
    ("逢田 珠里依", "AIDA JURII", "https://nearly-equal-joy.jp/image/profile/aida_jurii.jpg"),
    ("天野 香乃愛", "AMANO KONOA", "https://nearly-equal-joy.jp/image/profile/amano_konoa.jpg"),
    ("市原 愛弓", "ICHIHARA AYUMI", "https://nearly-equal-joy.jp/image/profile/ichihara_ayumi.jpg"),
    ("江角 怜音", "ESUMI RENON", "https://nearly-equal-joy.jp/image/profile/esumi_renon.jpg"),
    ("大信田 美月", "OSHIDA MITSUKI", "https://nearly-equal-joy.jp/image/profile/oshida_mitsuki.jpg"),
    ("大西 葵", "ONISHI AOI", "https://nearly-equal-joy.jp/image/profile/onishi_aoi.jpg"),
    ("小澤 愛実", "OZAWA AIMI", "https://nearly-equal-joy.jp/image/profile/ozawa_aimi.jpg"),
    ("髙橋 舞", "TAKAHASHI MAI", "https://nearly-equal-joy.jp/image/profile/takahashi_mai.jpg"),
    ("藤沢 莉子", "FUJISAWA RIKO", "https://nearly-equal-joy.jp/image/profile/fujisawa_riko.jpg"),
    ("村山 結香", "MURAYAMA YUUKA", "https://nearly-equal-joy.jp/image/profile/murayama_yuuka.jpg"),
    ("山田 杏佳", "YAMADA MOMOKA", "https://nearly-equal-joy.jp/image/profile/yamada_momoka.jpg"),
    ("山野 愛月", "YAMANO ARISU", "https://nearly-equal-joy.jp/image/profile/yamano_arisu.jpg"),
]

all_members = [
    ("equal-love", equal_love_members),
    ("not-equal-me", not_equal_me_members),
    ("nearly-equal-joy", nearly_equal_joy_members),
]

count = 0
for slug, members in all_members:
    group_id = groups[slug]
    for i, (name_ja, name_en, img_url) in enumerate(members):
        member_data = {
            "group_id": group_id,
            "name_ja": name_ja,
            "name_en": name_en,
            "profile_image_url": img_url,
            "sort_order": i,
        }
        status, err = api_post("members", member_data)
        if status == 201:
            print(f"  [OK] {name_ja} ({name_en})")
            count += 1
        else:
            print(f"  [FAIL] {name_ja}: {status} {err}")

print(f"\nInserted {count} members total.")
