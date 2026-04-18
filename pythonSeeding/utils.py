import re
import datetime
import pandas as pd
import psycopg2
from io import StringIO
import uuid
import bcrypt

# ---------------- CODEX LOGIC ----------------
def apply_codex_logic(df, save_conflicts=True, conflicts_filename="conflicts.csv"):
    before_count = len(df)

    df["hasCodeX"] = df["CodeXX"].notna() & (df["CodeXX"].astype(str).str.strip() != "")

    conflicts = df.groupby("nationalId").filter(
        lambda group: len(group) > 1 and group["hasCodeX"].all()
    )

    if save_conflicts and not conflicts.empty:
        conflicts.to_csv(conflicts_filename, index=False, encoding="utf-8-sig")
        print(f"[WARNING] {len(conflicts)} conflict rows saved to {conflicts_filename}")

    df = df.drop(conflicts.index)

    df = df.sort_values(by=["nationalId", "hasCodeX"], ascending=[True, False])
    df = df.drop_duplicates(subset=["nationalId"], keep="first")

    df = df.drop(columns=["hasCodeX"])
    df = df.reset_index(drop=True)

    after_count = len(df)

    print(f"👌 Rows before: {before_count}")
    print(f"✅ Rows after: {after_count}")
    print(f"❌ Rows removed: {before_count - after_count}")

    return df


# ---------------- CLEANING ----------------
def clean_national_id(national_id):
    if pd.isna(national_id):
        return None

    text = str(national_id).strip()
    cleaned = re.sub(r"[^A-Za-z0-9]", "", text)

    return cleaned if cleaned != "" else None


def clean_mobile(mobile):
    if pd.isna(mobile):
        return "UNKNOWN"

    text = str(mobile).strip()
    digits = re.sub(r"\D", "", text)

    return digits if digits != "" else "UNKNOWN"


def clean_name(name):
    if pd.isna(name):
        return None

    text = str(name).strip()
    words = text.split()

    return " ".join(words[:4])

def map_university(value):
    if pd.isna(value):
        return "Cairo University | جامعة القاهرة"

    text = str(value).strip().lower()

    if "حلوان" in text:
        return "Helwan University | جامعة حلوان"
    else:
        return "Cairo University | جامعة القاهرة"
    


def hash_password(password):
    if pd.isna(password):
        return None

    # نفس trim
    password = str(password).strip()

    # bcrypt requires bytes
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=4))

    return hashed.decode("utf-8")


def map_product_id(systemToRegisterIn, courseToAttend=None):
    if pd.isna(systemToRegisterIn):
        systemToRegisterIn = "تدريب مكثف  (دراسات عليا)"

    system = str(systemToRegisterIn).strip()
    course = str(courseToAttend).strip() if courseToAttend else None

    # Case 1
    if system == "تدريب مكثف (ترقيات أعضاء هيئة التدريس- دورة واحدة)":
        return "a70026e4-ee38-442a-9af7-a2b955a1f09c"

    # Case 2 (depends on courseToAttend)
    if system == "تدريب مكثف  (دراسات عليا)":
        if course == "عن بعد عبر الأنترنت (أون لاين)":
            return "a2cfc1fb-5b02-4473-b7d4-4f27d921b112"

        if course == "دخول الإمتحانات مباشرة دون التدريب":
            return "a3b9ab72-09e9-41b8-8c2b-3e52c5d9cde6"

    return None

import os

def export_final_csv(df, filename="final_output.csv", mode="a"):
    file_exists = os.path.isfile(filename)

    df.to_csv(
        filename,
        mode=mode,
        index=False,
        header=not file_exists,
        encoding="utf-8-sig"
    )