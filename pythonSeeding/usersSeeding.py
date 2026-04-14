import datetime
import pandas as pd
import psycopg2
from io import StringIO
import uuid

df = pd.read_csv("studentsData.csv", encoding='utf-8')


##### 🧹 إزالة التكرار حسب nationalId
df = df.drop_duplicates(subset=["nationalId"]).reset_index(drop=True)
duplicates = df[df.duplicated(subset=["nationalId"], keep=False)]
if not duplicates.empty:
    print("⚠️ كان فيه duplicates وتم حذفهم:")
    print(duplicates)


df["role"] = df["role"].str.upper()

df["userId"] = [str(uuid.uuid4()) for _ in range(len(df))]


if "updatedAt" not in df.columns:
    df["updatedAt"] = datetime.datetime.now()


# 5. نختار الأعمدة اللي عايزينها فقط — ب ترتيب يناسب جدولك
df = df[["userId","email", "passwordHash", "role", "createdAt", "updatedAt" ]]


# 6. نحولها لتنسيق نص CSV مؤقت
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

# bulk insert
# cur.copy_from(buffer, "users", sep=",")
cur.copy_expert('COPY users ("userId", email, "passwordHash", role, "createdAt", "updatedAt") FROM STDIN WITH (FORMAT csv)', buffer)


conn.commit()
cur.close()
conn.close()

print("✅ تم إدخال البيانات بنجاح!")