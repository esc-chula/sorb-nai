import csv
import json
import re

def clean(s: str) -> str:
    if s is None:
        return ""
    # Collapse internal newlines/spaces inside quoted cells
    return re.sub(r"\s+", " ", s).strip()

res = {}
current_id = None
last_group = None

with open("ise.csv", "r", encoding="utf-8-sig", newline="") as f:
    reader = csv.reader(f)
    header = next(reader, None)  # skip header

    for row in reader:
        # Skip fully empty rows
        if not any((c or "").strip() for c in row):
            continue

        # Pad row to expected length
        if len(row) < 11:
            row += [""] * (11 - len(row))

        cancelled_in_row = any("cancelled" in (c or "").lower() for c in row)

        course_id_raw = clean(row[1])
        course_id_num = course_id_raw.replace("*", "")

        # New course row begins if we have a numeric course id
        if course_id_raw and course_id_num.isdigit():
            current_id = course_id_num

            title = clean(row[2])
            date = clean(row[4])
            time = clean(row[5])
            sec = clean(row[3])
            building = clean(row[7])
            room = clean(row[8])

            if cancelled_in_row:
                date = "CANCELLED"
                time = "CANCELLED"

            res[current_id] = {
                "code": current_id,
                "title": title,
                "date": date,
                "time": time,
                "group": []
            }

            group = {
                "sec": sec,
                "building": [building] if building else [],
                "room": [room] if room else [],
            }
            res[current_id]["group"].append(group)
            last_group = group
            continue

        # Continuation row (same course, possibly more rooms or new sec-group)
        if current_id is None:
            continue

        # If any continuation row marks cancellation, reflect it at course level
        if cancelled_in_row:
            res[current_id]["date"] = "CANCELLED"
            res[current_id]["time"] = "CANCELLED"

        sec = clean(row[3])
        building = clean(row[7])
        room = clean(row[8])

        # If sec is empty or same as the last group's sec, append to that group
        if not sec or (last_group and sec == last_group["sec"]):
            if building:
                last_group["building"].append(building)
            if room:
                last_group["room"].append(room)
        else:
            # Start a new group for a different sec within the same course
            group = {
                "sec": sec,
                "building": [building] if building else [],
                "room": [room] if room else [],
            }
            res[current_id]["group"].append(group)
            last_group = group

# Write JSON
with open("sheet.json", "w", encoding="utf-8") as out:
    json.dump(res, out, ensure_ascii=False, indent=2)
