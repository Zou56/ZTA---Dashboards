"""
Synthetic User Activity Log Dataset Generator
For Anomaly Detection Testing with Isolation Forest
Research: Big Data Analytics + Zero Trust Architecture
"""

import csv
import random
import math
from datetime import datetime, timedelta

# ─── Seed for reproducibility ───────────────────────────────────────────────
random.seed(42)

# ─── Constants ───────────────────────────────────────────────────────────────
OUTPUT_FILE = "user_activity_logs.csv"
TOTAL_ROWS   = 1200   # target: at least 1000

# User pool
NUM_USERS = 40
USER_IDS  = [f"USR{str(i).zfill(3)}" for i in range(1, NUM_USERS + 1)]

# Normal resources vs sensitive resources
NORMAL_RESOURCES    = ["dashboard", "API"]
SENSITIVE_RESOURCES = ["admin_panel", "database"]
ALL_RESOURCES       = NORMAL_RESOURCES + SENSITIVE_RESOURCES

# Device types
DEVICE_TYPES = ["mobile", "desktop", "tablet"]

# ─── Per-user profile: consistent home city/country & preferred device ───────
LOCATION_POOL = [
    ("Jakarta",    "Indonesia"),
    ("Surabaya",   "Indonesia"),
    ("Bandung",    "Indonesia"),
    ("Yogyakarta", "Indonesia"),
    ("Medan",      "Indonesia"),
    ("Makassar",   "Indonesia"),
    ("Semarang",   "Indonesia"),
    ("Bali",       "Indonesia"),
]

user_profiles = {}
for uid in USER_IDS:
    user_profiles[uid] = {
        "home_location": random.choice(LOCATION_POOL),
        "preferred_device": random.choice(DEVICE_TYPES),
    }

# Subnet pool (for consistent IP per location)
SUBNET_NORMAL   = ["36.68", "114.121", "180.244", "103.28", "182.1"]
SUBNET_ANOMALY_EU = ["185.220", "62.210", "195.154", "91.108"]
SUBNET_ANOMALY_US = ["104.244", "198.96", "172.111"]

def rand_ip(subnets):
    s = random.choice(subnets)
    return f"{s}.{random.randint(0,255)}.{random.randint(1,254)}"

# ─── Base start date ──────────────────────────────────────────────────────────
BASE_DATE = datetime(2025, 1, 1, 8, 0, 0)

# ─── Helpers ─────────────────────────────────────────────────────────────────
def random_normal_timestamp(base: datetime) -> datetime:
    """Working hours 08:00–18:00, random day offset."""
    day_offset = random.randint(0, 89)          # ~3 months of data
    hour       = random.randint(8, 17)
    minute     = random.randint(0, 59)
    second     = random.randint(0, 59)
    return base + timedelta(days=day_offset, hours=hour - 8,
                            minutes=minute, seconds=second)

def fmt(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d %H:%M:%S")

# ─── Row builder ─────────────────────────────────────────────────────────────
rows = []

def add_row(user_id, timestamp, ip, city, country, device,
            login_status, session_dur, resource, activity_count):
    rows.append({
        "user_id":           user_id,
        "timestamp":         fmt(timestamp),
        "ip_address":        ip,
        "location":          f"{city}, {country}",
        "device_type":       device,
        "login_status":      login_status,
        "session_duration":  round(session_dur, 2),
        "access_resource":   resource,
        "activity_count":    activity_count,
    })

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 1 — NORMAL BEHAVIOR  (~80 % of data → ~960 rows)
# ═════════════════════════════════════════════════════════════════════════════
normal_target = 960

for _ in range(normal_target):
    uid    = random.choice(USER_IDS)
    prof   = user_profiles[uid]
    city, country = prof["home_location"]
    device = prof["preferred_device"]
    ts     = random_normal_timestamp(BASE_DATE)
    ip     = rand_ip(SUBNET_NORMAL)

    # Mostly success logins, rare failures
    login_status = "success" if random.random() < 0.92 else "failed"
    session_dur  = round(random.uniform(5, 60), 2)
    resource     = random.choices(
        ALL_RESOURCES, weights=[45, 45, 5, 5], k=1
    )[0]
    activity     = random.randint(10, 100)

    add_row(uid, ts, ip, city, country, device,
            login_status, session_dur, resource, activity)

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 2 — ANOMALY INJECTION  (~20 % → ~240 rows total, ~40 each type)
# ═════════════════════════════════════════════════════════════════════════════

# ── A. Impossible Travel ──────────────────────────────────────────────────────
# Same user, two logins: Indonesia then Europe within 10 minutes
ANOMALY_A_USERS = random.sample(USER_IDS, 8)
EUROPEAN_CITIES = [("Amsterdam", "Netherlands"), ("London", "UK"),
                   ("Paris", "France"), ("Berlin", "Germany"),
                   ("Moscow", "Russia"), ("Warsaw", "Poland")]

for uid in ANOMALY_A_USERS:
    prof = user_profiles[uid]
    city_h, country_h = prof["home_location"]
    device = prof["preferred_device"]

    # First login — from Indonesia (normal)
    ts1 = random_normal_timestamp(BASE_DATE)
    ip1 = rand_ip(SUBNET_NORMAL)
    add_row(uid, ts1, ip1, city_h, country_h, device,
            "success", round(random.uniform(5, 20), 2),
            "dashboard", random.randint(10, 60))

    # Second login — from Europe, only 5–15 minutes later
    gap_minutes = random.randint(5, 15)
    ts2 = ts1 + timedelta(minutes=gap_minutes)
    eu_city, eu_country = random.choice(EUROPEAN_CITIES)
    ip2 = rand_ip(SUBNET_ANOMALY_EU)
    add_row(uid, ts2, ip2, eu_city, eu_country, device,
            "success", round(random.uniform(1, 10), 2),
            random.choice(ALL_RESOURCES), random.randint(5, 80))

# ── B. Abnormal Login Time (02:00 – 04:00 AM) ────────────────────────────────
for _ in range(45):
    uid  = random.choice(USER_IDS)
    prof = user_profiles[uid]
    city, country = prof["home_location"]
    device = prof["preferred_device"]

    day_offset = random.randint(0, 89)
    hour       = random.randint(2, 3)
    minute     = random.randint(0, 59)
    ts = BASE_DATE + timedelta(days=day_offset, hours=hour - 8,
                               minutes=minute)
    ip = rand_ip(SUBNET_NORMAL)
    login_status = "success" if random.random() < 0.75 else "failed"
    session_dur  = round(random.uniform(1, 30), 2)
    resource     = random.choices(ALL_RESOURCES, weights=[30, 30, 20, 20], k=1)[0]
    activity     = random.randint(5, 200)

    add_row(uid, ts, ip, city, country, device,
            login_status, session_dur, resource, activity)

# ── C. Unusual Resource Access (admin_panel / database by normal user) ────────
for _ in range(40):
    uid  = random.choice(USER_IDS)
    prof = user_profiles[uid]
    city, country = prof["home_location"]
    device = prof["preferred_device"]
    ts   = random_normal_timestamp(BASE_DATE)
    ip   = rand_ip(SUBNET_NORMAL)

    add_row(uid, ts, ip, city, country, device,
            "success", round(random.uniform(2, 25), 2),
            random.choice(SENSITIVE_RESOURCES), random.randint(5, 50))

# ── D. Device Change (sudden switch to unknown desktop) ───────────────────────
for _ in range(35):
    uid  = random.choice(USER_IDS)
    prof = user_profiles[uid]
    city, country = prof["home_location"]
    ts   = random_normal_timestamp(BASE_DATE)
    ip   = rand_ip(SUBNET_ANOMALY_US)

    # Pick a device clearly different from the user's usual
    usual = prof["preferred_device"]
    other_devices = [d for d in DEVICE_TYPES if d != usual]
    anomalous_device = random.choice(other_devices)

    add_row(uid, ts, ip, city, country, anomalous_device,
            "success", round(random.uniform(5, 40), 2),
            random.choice(ALL_RESOURCES), random.randint(20, 150))

# ── E. High Activity Spike (>500 actions) ────────────────────────────────────
for _ in range(35):
    uid  = random.choice(USER_IDS)
    prof = user_profiles[uid]
    city, country = prof["home_location"]
    device = prof["preferred_device"]
    ts   = random_normal_timestamp(BASE_DATE)
    ip   = rand_ip(SUBNET_NORMAL)

    add_row(uid, ts, ip, city, country, device,
            "success", round(random.uniform(10, 60), 2),
            random.choice(ALL_RESOURCES), random.randint(501, 2000))

# ── F. Short Session Burst (many logins, session duration < 1 min) ───────────
BURST_USERS = random.sample(USER_IDS, 6)
for uid in BURST_USERS:
    prof = user_profiles[uid]
    city, country = prof["home_location"]
    device = prof["preferred_device"]

    num_bursts = random.randint(5, 8)
    base_ts    = random_normal_timestamp(BASE_DATE)
    for b in range(num_bursts):
        ts = base_ts + timedelta(minutes=b * random.uniform(0.5, 2))
        ip = rand_ip(SUBNET_NORMAL)
        login_status = "failed" if b < num_bursts - 1 else "success"
        add_row(uid, ts, ip, city, country, device,
                login_status, round(random.uniform(0.05, 0.9), 2),
                random.choice(ALL_RESOURCES), random.randint(1, 10))

# ═════════════════════════════════════════════════════════════════════════════
# Shuffle & Write CSV
# ═════════════════════════════════════════════════════════════════════════════
random.shuffle(rows)

FIELDNAMES = [
    "user_id", "timestamp", "ip_address", "location",
    "device_type", "login_status", "session_duration",
    "access_resource", "activity_count",
]

with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
    writer.writeheader()
    writer.writerows(rows)

# ─── Summary Report ──────────────────────────────────────────────────────────
total = len(rows)
print("=" * 60)
print("  DATASET GENERATION COMPLETE")
print("=" * 60)
print(f"  Output file  : {OUTPUT_FILE}")
print(f"  Total rows   : {total}")
print(f"  Normal rows  : {normal_target}  ({normal_target/total*100:.1f}%)")
anomaly_total = total - normal_target
print(f"  Anomaly rows : {anomaly_total}  ({anomaly_total/total*100:.1f}%)")
print()
print("  Anomaly breakdown:")
print(f"    A. Impossible Travel     : {len(ANOMALY_A_USERS)*2} rows")
print(f"    B. Abnormal Login Time   : 45 rows")
print(f"    C. Unusual Resource      : 40 rows")
print(f"    D. Device Change         : 35 rows")
print(f"    E. High Activity Spike   : 35 rows")
print(f"    F. Short Session Burst   : {sum(range(5,9))} rows (variable per user)")
print()
print("  Columns:", ", ".join(FIELDNAMES))
print("=" * 60)
print("  Ready for Isolation Forest anomaly detection!")
print("=" * 60)
