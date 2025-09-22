import csv
import json
import re
from typing import Optional

def clean(s: Optional[str]) -> str:
    if s is None:
        return ""
    # collapse internal whitespace and newlines inside quoted cells
    return re.sub(r"\s+", " ", s).strip()

def to_int(s: str) -> Optional[int]:
    # extract the last integer seen in the string (covers "41+2=43", "0 / 5", etc.)
    nums = re.findall(r"\d+", s or "")
    return int(nums[-1]) if nums else None

def fmt_time(t: str) -> str:
    t = clean(t).replace("–", "-").replace(" ", "")
    # 0830-1030 -> 08:30-10:30
    m = re.fullmatch(r"(\d{4})-(\d{4})", t)
    if m:
        a, b = m.groups()
        return f"{a[:2]}:{a[2:]}-{b[:2]}:{b[2:]}"
    # already HH:MM-HH:MM
    m = re.fullmatch(r"\d{2}:\d{2}-\d{2}:\d{2}", t)
    if m:
        return t
    # "13:00 - 15:00" -> "13:00-15:00"
    m = re.fullmatch(r"(\d{2}:\d{2})-(\d{2}:\d{2})", t)
    if m:
        return t
    return clean(t)

res = {}
current_no = None
last_building = None  # per-course carry-over when building is omitted on continuation lines

with open("excel.csv", "r", encoding="utf-8-sig", newline="") as f:
    reader = csv.reader(f)

    # Skip the preface lines (title + blank) and read the header
    next(reader, None)  # title
    next(reader, None)  # blank
    header = next(reader, None)  # "ที่,รหัสวิชา,..."
    # Expect 10 columns overall
    EXPECTED_COLS = 10

    for row in reader:
        if not row:
            continue
        # Pad/truncate row to expected length
        if len(row) < EXPECTED_COLS:
            row += [""] * (EXPECTED_COLS - len(row))
        elif len(row) > EXPECTED_COLS:
            row = row[:EXPECTED_COLS]

        # Clean all cells
        row = [clean(c) for c in row]

        # Skip fully empty rows
        if not any(row):
            continue

        no_col     = row[0]  # ที่
        code_col   = row[1]  # รหัสวิชา
        title_col  = row[2]  # ชื่อย่อรายวิชา
        date_col   = row[3]  # วันสอบ
        time_col   = row[4]  # เวลาสอบ
        sum_col    = row[5]  # จำนวนนิสิต
        b_col      = row[6]  # อาคาร
        room_col   = row[7]  # ห้องเรียน
        count_col  = row[8]  # จำนวน
        range_col  = row[9]  # เลขประจำตัวนิสิต

        is_new_course = (no_col.isdigit() and code_col.isdigit())

        if is_new_course:
            current_no = no_col
            last_building = None

            sum_students = to_int(sum_col)
            res[current_no] = {
                "code": code_col,
                "title": title_col,
                "date": date_col,               # keep original date format
                "time": fmt_time(time_col),     # normalize time to HH:MM-HH:MM when possible
                "sum_student": sum_students if sum_students is not None else 0,
                "group": []
            }

            # First row may also carry a room allocation
            sec_val = sum_col if sum_col.lower().startswith("sec") else ""
            building = b_col
            room = (room_col + (f" {sec_val}" if sec_val else "")).strip()
            students = to_int(count_col)
            rng = range_col

            if building or room or rng or (students is not None and students > 0):
                if not building:
                    building = last_building or ""
                else:
                    last_building = building
                res[current_no]["group"].append({
                    "building": building,
                    "room": room,
                    "students": students if students is not None else 0,
                    "range": rng
                })
            continue

        # Continuation lines for the current course
        if not current_no:
            continue  # orphan continuation, skip

        # Ignore pure-blank continuation
        if not any([b_col, room_col, count_col, range_col, sum_col]):
            continue

        sec_val = sum_col if sum_col.lower().startswith("sec") else ""
        building = b_col or last_building or ""
        room = (room_col + (f" {sec_val}" if sec_val else "")).strip()
        students = to_int(count_col)
        rng = range_col

        # If still nothing useful, skip
        if not building and not room and not rng and students is None:
            continue

        if building:
            last_building = building

        res[current_no]["group"].append({
            "building": building,
            "room": room,
            "students": students if students is not None else 0,
            "range": rng
        })

# Write JSON (to public to match your structure/showcase)
with open("sheet.json", "w", encoding="utf-8") as out:
    json.dump(res, out, ensure_ascii=False, indent=2)
