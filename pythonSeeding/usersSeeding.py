import datetime
import pandas as pd
import psycopg2
from io import StringIO
import uuid
from utils import apply_codex_logic, clean_national_id, hash_password

# ---------------- READ CSV ----------------
df = pd.read_csv("main_FINAL_version.csv", encoding="utf-8")

# ---------------- CODEX LOGIC (BEFORE CLEANING) ----------------
df = apply_codex_logic(df, True, "conflicts_before_cleaning.csv")

# ---------------- CLEAN NATIONAL ID ----------------
df["nationalId"] = df["nationalId"].apply(clean_national_id)

# ---------------- CODEX LOGIC (AFTER CLEANING) ----------------
df = apply_codex_logic(df, True, "conflicts_after_cleaning.csv")

# ---------------- HANDLE NULL NATIONAL ID ----------------
mask_null = df["nationalId"].isna()
df.loc[mask_null, "nationalId"] = [f"TEMP_NULL_{i}" for i in range(mask_null.sum())]

# ---------------- AUDIT DUPLICATES ----------------
duplicates_mask = df["nationalId"].duplicated(keep=False)
duplicates_df = df[duplicates_mask]

if not duplicates_df.empty:
    duplicates_df.to_csv("nationalId_duplicates_audit.csv", index=False, encoding="utf-8-sig")
    print(f"[WARNING] {len(duplicates_df)} duplicate rows saved for audit")

df["nationalId"] = df["nationalId"].astype(str)

df.loc[duplicates_mask, "nationalId"] = [
    f"{val}_{i}" for i, val in enumerate(df.loc[duplicates_mask, "nationalId"])
]

print(f"[INFO] NULL nationalId fixed: {mask_null.sum()}")
print(f"[INFO] Duplicate nationalId fixed: {duplicates_mask.sum()}")

# ---------------- USERS PREP ----------------
df["role"] = df["role"].str.upper()
df["userId"] = [str(uuid.uuid4()) for _ in range(len(df))]

now = datetime.datetime.now()
df["createdAt"] = now
df["updatedAt"] = now

df = df[["userId", "email", "passwordHash", "role", "createdAt", "updatedAt"]]

df["createdAt"] = df["createdAt"].dt.strftime("%Y-%m-%d %H:%M:%S")
df["updatedAt"] = df["updatedAt"].dt.strftime("%Y-%m-%d %H:%M:%S")

# ---------------- HASH PASSWORD ----------------
df["passwordHash"] = [
    hash_password(p) for p in df["passwordHash"]
]

# ---------------- INSERT ----------------
buffer = StringIO()
df.to_csv(buffer, index=False, header=False)
buffer.seek(0)

conn = psycopg2.connect(
    dbname="Digital Transformation",
    user="postgres",
    password="123",
    host="localhost"
)

cur = conn.cursor()

cur.copy_expert(
    '''
    COPY users ("userId", email, "passwordHash", role, "createdAt", "updatedAt")
    FROM STDIN WITH (FORMAT csv)
    ''',
    buffer
)

conn.commit()
cur.close()
conn.close()

print("[SUCCESS] Users inserted successfully!")