import datetime
import pandas as pd
import psycopg2
from io import StringIO
from utils import apply_codex_logic, clean_national_id, clean_mobile, clean_name, map_university,map_product_id,export_final_csv

# ---------------- DB ----------------
conn = psycopg2.connect(
    dbname="Digital Transformation",
    user="postgres",
    password="123",
    host="localhost"
)
cur = conn.cursor()

# ---------------- READ CSV ----------------
df = pd.read_csv("main_FINAL_version.csv", encoding="utf-8")

# ---------------- CODEX ----------------
df = apply_codex_logic(df, True, "conflicts_before_cleaning.csv")

df["NameEn"] = df["NameEn"].apply(clean_name)
df["nationalId"] = df["nationalId"].apply(clean_national_id)

df = apply_codex_logic(df, True, "conflicts_after_cleaning.csv")

# ---------------- HANDLE NULL ----------------
# pipeline:
    # - handle null
    # - audit duplicates
    # - fix uniqueness
mask_null = df["nationalId"].isna()
df.loc[mask_null, "nationalId"] = [f"TEMP_NULL_{i}" for i in range(mask_null.sum())]

duplicates_mask = df["nationalId"].duplicated(keep=False)

if duplicates_mask.any():
    df[duplicates_mask].to_csv("nationalId_duplicates_audit.csv", index=False, encoding="utf-8-sig")
    print(f"[WARNING] {duplicates_mask.sum()} duplicate rows saved for audit")

df["nationalId"] = df["nationalId"].astype(str)

df.loc[duplicates_mask, "nationalId"] = [
    f"{val}_{i}" for i, val in enumerate(df.loc[duplicates_mask, "nationalId"])
]

# ---------------- CLEAN MOBILE ----------------
df["Mobile"] = df["Mobile"].apply(clean_mobile)

# ---------------- MAPPING ----------------
df["nationality"] = df["nationality"].astype(str).str.strip().replace({
    "Egypt": "Egyptian"
})

df["StudyLan"] = df["StudyLan"].astype(str).str.strip().replace({
    "العربية": "AR",
    "الإنجليزية": "EN"
})

df["university"] = df["university"].apply(map_university)

df["productId"] = df.apply(
    lambda row: map_product_id(
        row["systemToRegisterIn"],
        row.get("courseToAttend")
    ),
    axis=1
)

# ---------------- USER IDS ----------------
cur.execute('SELECT "userId" FROM users ORDER BY "userId" ASC;')
df["userId"] = [row[0] for row in cur.fetchall()]

# ---------------- TYPE ----------------
def detect_type(value):
    if pd.isna(value):
        return None
    text = str(value).strip()

    if "دكتور" in text or "دكتوراه" in text:
        return 1
    elif "ماجستير" in text:
        return 2
    elif "دبلوم" in text:
        return 3
    elif any(x in text for x in ["تدريس", "التدريس", "ترقيات", "هيئه", "هيئة"]):
        return 4
    return None

df["type"] = df["type"].apply(detect_type)

if df["type"].isna().any():
    raise ValueError("[ERROR] Invalid type values found")

print("[SUCCESS] Type mapping completed")

# ---------------- DEFAULTS ----------------
now = datetime.datetime.now()
df["createdAt"] = now
df["updatedAt"] = now

if "profilePhoto" not in df.columns:
    df["profilePhoto"] = None

df["StudyLan"] = df["StudyLan"].fillna("AR")

# ---------------- FINAL ----------------
df = df[
    ["userId","fullName","nationality","nationalId","nationalIdImage",
     "university","college","createdAt","updatedAt","NameEn",
     "Mobile","StudyLan","department","type","status","profilePhoto","productId"]
]

df["createdAt"] = df["createdAt"].dt.strftime("%Y-%m-%d %H:%M:%S")
df["updatedAt"] = df["updatedAt"].dt.strftime("%Y-%m-%d %H:%M:%S")

export_final_csv(df, "final_students_dataset.csv")

# ---------------- INSERT ----------------
buffer = StringIO()
df.to_csv(buffer, index=False, header=False)
buffer.seek(0)

cur.copy_expert(
    '''
    COPY students (
        "userId","fullName",nationality,"nationalId","nationalIdImage",
        university,college,"createdAt","updatedAt","NameEn",
        "Mobile","StudyLan",department,type,status,"profilePhoto","productId"
    )
    FROM STDIN WITH (FORMAT csv)
    ''',
    buffer
)

conn.commit()
cur.close()
conn.close()

print("[SUCCESS] Students inserted successfully!")