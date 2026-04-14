import datetime
import pandas as pd
import psycopg2
from io import StringIO

conn = psycopg2.connect(
    dbname="Digital Transformation",
    user="postgres",
    password="123",
    host="localhost"
)
cur = conn.cursor()

df = pd.read_csv("studentsData.csv", encoding='utf-8')



##### 🧹 إزالة التكرار حسب nationalId
df = df.drop_duplicates(subset=["nationalId"]).reset_index(drop=True)
duplicates = df[df.duplicated(subset=["nationalId"], keep=False)]
if not duplicates.empty:
    print("⚠️ كان فيه duplicates وتم حذفهم:")
    print(duplicates)



cur.execute('SELECT "userId" FROM users ORDER BY "userId" ASC;')
user_ids = [row[0] for row in cur.fetchall()]


df["userId"] = user_ids #bgeb el forign keys



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
    elif "تدريس" in text or "التدريس" in text or "ترقيات" in text or "هيئه" in text or "هيئة" in text:
        return 4
    else:
        return None  # مش معروف

df["type"] = df["type"].apply(detect_type) # .apply = map + contains

# لو في قيم مش متعرف عليها نطبعهم
if df["type"].isna().any():
    missing_rows = df[df["type"].isna()]
    print("❌ Error: فيه صفوف فيها قيم type مش متعرّفة:")
    print(missing_rows)
    raise ValueError("فيه قيم type مش متعرّفة أو فيها أخطاء إملائية كبيرة")

print("✅ تم تحويل القيم النصية إلى أرقام بنجاح!")



if "updatedAt" not in df.columns:
    df["updatedAt"] = datetime.datetime.now() 

if "profilePhoto" not in df.columns:
    df["profilePhoto"] = None  # null

# Default study language when CSV has null/empty value
df["StudyLan"] = df["StudyLan"].fillna("").astype(str).str.strip()
df.loc[df["StudyLan"] == "", "StudyLan"] = "العربية"

# 5. نختار الأعمدة اللي عايزينها فقط — بأي ترتيب يناسب جدولك
df = df[["userId", "fullName", "nationality", "nationalId","nationalIdImage", "university", 
"college", "createdAt", "updatedAt", "NameEn", "Mobile", "StudyLan", "department",
 "type", "status", "profilePhoto" ]]


buffer = StringIO()
df.to_csv(buffer, index=False, header=False)
buffer.seek(0)

# bulk insert
# cur.copy_from(buffer, "users", sep=",")
cur.copy_expert(
    '''
    COPY students ("userId", "fullName", nationality, "nationalId", "nationalIdImage",
                 university, college, "createdAt", "updatedAt", "NameEn",
                 "Mobile", "StudyLan", department, type, status, "profilePhoto")
    FROM STDIN WITH (FORMAT csv)
    ''',
    buffer
)

conn.commit()
cur.close()
conn.close()

print("✅ تم إدخال البيانات بنجاح!")