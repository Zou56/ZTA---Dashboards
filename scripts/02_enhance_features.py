"""
Dataset Enhancement Script
Tambahan: Impossible Travel, Midnight Login, Device Change Flag
Research: Big Data Analytics + Zero Trust Architecture
"""

import pandas as pd
import numpy as np
from datetime import timedelta

# ─── Load dataset ─────────────────────────────────────────────────────────────
df = pd.read_csv("user_activity_logs.csv")
df['timestamp'] = pd.to_datetime(df['timestamp'])

print(f"Dataset loaded: {len(df)} rows, {df['user_id'].nunique()} unique users")

# =============================================================================
# 1. TAMBAH KOLOM BARU
# =============================================================================

# Login hour — penting sebagai fitur numerik untuk Isolation Forest
df['login_hour'] = df['timestamp'].dt.hour

# Simpan device default (mode) per user sebelum inject anomali
user_device_map = (
    df.groupby('user_id')['device_type']
      .agg(lambda x: x.mode()[0])
      .to_dict()
)

print("✅ [1/5] login_hour column added | user_device_map built")

# =============================================================================
# 2. MIDNIGHT LOGIN ANOMALY  (~10% data)
# =============================================================================

midnight_idx = df.sample(frac=0.10, random_state=42).index

df.loc[midnight_idx, 'timestamp'] = df.loc[midnight_idx, 'timestamp'].apply(
    lambda x: x.replace(hour=int(np.random.randint(2, 4)),
                         minute=int(np.random.randint(0, 59)),
                         second=int(np.random.randint(0, 59)))
)

# Update login_hour setelah modify timestamp
df['login_hour'] = df['timestamp'].dt.hour

print(f"✅ [2/5] Midnight anomaly injected: {len(midnight_idx)} rows → hour 02–03")

# =============================================================================
# 3. DEVICE SWITCH ANOMALY  (~10% data)
# =============================================================================

device_idx = df.sample(frac=0.10, random_state=1).index

df.loc[device_idx, 'device_type'] = np.random.choice(
    ['unknown_desktop', 'hacker_device', 'bot_device'],
    size=len(device_idx)
)

print(f"✅ [3/5] Device switch anomaly injected: {len(device_idx)} rows")

# =============================================================================
# 4. IMPOSSIBLE TRAVEL  (~10% data)
# =============================================================================

extreme_locations = [
    "Jakarta, Indonesia",
    "Berlin, Germany",
    "New York, USA",
    "Tokyo, Japan",
    "London, UK",
    "Moscow, Russia",
    "Sydney, Australia",
    "São Paulo, Brazil",
]

travel_idx = df.sample(frac=0.10, random_state=7).index
injected_travel = 0

for idx in travel_idx:
    user      = df.loc[idx, 'user_id']
    user_rows = df[df['user_id'] == user]

    if len(user_rows) > 1:
        other_idx = user_rows.sample(1, random_state=int(idx)).index[0]

        # Pilih lokasi yang berbeda dari lokasi row lain
        current_loc = df.loc[other_idx, 'location']
        candidates  = [l for l in extreme_locations if l != current_loc]
        df.loc[idx, 'location'] = np.random.choice(candidates)

        # Timestamp sangat dekat (impossible travel: +10 menit)
        df.loc[idx, 'timestamp'] = (
            df.loc[other_idx, 'timestamp'] + timedelta(minutes=10)
        )
        injected_travel += 1

# Update login_hour lagi setelah timestamp travel diubah
df['login_hour'] = df['timestamp'].dt.hour

print(f"✅ [4/5] Impossible travel injected: {injected_travel} rows")

# =============================================================================
# 5. FLAG FITUR PENTING
# =============================================================================

# — Device Change Flag —
df['device_change_flag'] = df.apply(
    lambda x: 1 if x['device_type'] not in [
        user_device_map.get(x['user_id'], x['device_type']),
        'mobile', 'desktop', 'tablet'          # normal devices
    ] else 0,
    axis=1
)

# Sort by user + time sebelum rolling/shift ops
df = df.sort_values(by=['user_id', 'timestamp']).reset_index(drop=True)

# — Location Change Flag (beda lokasi dari sesi sebelumnya per user) —
df['location_change_flag'] = (
    df.groupby('user_id')['location']
      .apply(lambda x: (x != x.shift()).astype(int))
      .reset_index(level=0, drop=True)
)

# — Midnight Login Flag (jam 00–05) —
df['midnight_login_flag'] = df['login_hour'].apply(
    lambda h: 1 if 0 <= h <= 5 else 0
)

# — High Activity Flag (>500 actions) —
df['high_activity_flag'] = df['activity_count'].apply(
    lambda c: 1 if c > 500 else 0
)

# — Short Session Flag (<1 min) —
df['short_session_flag'] = df['session_duration'].apply(
    lambda s: 1 if s < 1.0 else 0
)

print("✅ [5/5] Feature flags added:")
print(f"         device_change_flag    : {df['device_change_flag'].sum()} flagged rows")
print(f"         location_change_flag  : {df['location_change_flag'].sum()} flagged rows")
print(f"         midnight_login_flag   : {df['midnight_login_flag'].sum()} flagged rows")
print(f"         high_activity_flag    : {df['high_activity_flag'].sum()} flagged rows")
print(f"         short_session_flag    : {df['short_session_flag'].sum()} flagged rows")

# =============================================================================
# SAVE
# =============================================================================

output_file = "dataset_fixed.csv"
df.to_csv(output_file, index=False)

# ─── Final Summary ────────────────────────────────────────────────────────────
print()
print("=" * 60)
print("  DATASET FIXED & SAVED")
print("=" * 60)
print(f"  Output file : {output_file}")
print(f"  Total rows  : {len(df)}")
print(f"  Columns     : {len(df.columns)}")
print()
print("  Final columns:")
for col in df.columns:
    dtype = str(df[col].dtype)
    print(f"    • {col:<25} [{dtype}]")
print()
print("  Device type distribution:")
print(df['device_type'].value_counts().to_string())
print()
print("  Login hour distribution (anomaly hours 02-03):")
night = df[df['login_hour'].isin([2, 3])]['login_hour'].value_counts().sort_index()
print(night.to_string() if not night.empty else "   none")
print()
print("  Location sample (impossible travel):")
foreign = df[~df['location'].str.contains("Indonesia", na=False)]['location'].value_counts().head(8)
print(foreign.to_string() if not foreign.empty else "   none")
print()
print("  ✅ Ready for Isolation Forest!")
print("=" * 60)
