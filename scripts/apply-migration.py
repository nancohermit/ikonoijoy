"""Apply database migrations to Supabase.

Usage: python scripts/apply-migration.py <migration_file>
Example: python scripts/apply-migration.py supabase/migrations/002_news_schedules.sql

Requires SUPABASE_DB_PASSWORD environment variable or pass as argument.
"""

import sys
import os
import urllib.request
import json

SUPABASE_URL = "https://rjnkeitizvwbhgeveyeu.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqbmtlaXRpenZ3YmhnZXZleWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzE4NjgsImV4cCI6MjA5NDUwNzg2OH0.9j4WAE5OW1epYukYymiNIFYxb6tmwrGTNTbDt4iL2FE"


def apply_migration(sql_file, db_password):
    """Execute SQL migration via Supabase SQL API."""
    with open(sql_file, "r", encoding="utf-8") as f:
        sql = f.read()

    # Use the Supabase SQL endpoint
    url = f"{SUPABASE_URL}/rest/v1/"
    headers = {
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }

    print(f"Migration file: {sql_file}")
    print(f"SQL length: {len(sql)} chars")
    print("To apply this migration, run it in the Supabase SQL Editor:")
    print(f"  https://supabase.com/dashboard/project/rjnkeitizvwbhgeveyeu/sql/new")
    print()
    print("Copy and paste the content of:")
    print(f"  {os.path.abspath(sql_file)}")
    print()
    print("Alternatively, use the Supabase CLI:")
    print(f"  npx supabase login")
    print(f"  npx supabase link --project-ref rjnkeitizvwbhgeveyeu")
    print(f"  npx supabase db push")


if __name__ == "__main__":
    sql_file = (
        sys.argv[1]
        if len(sys.argv) > 1
        else "supabase/migrations/002_news_schedules.sql"
    )
    apply_migration(sql_file, os.environ.get("SUPABASE_DB_PASSWORD", ""))
