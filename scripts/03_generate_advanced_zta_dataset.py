"""
Advanced ZTA Dataset Generator
==============================
Generates a highly realistic synthetic user activity dataset with temporal consistency,
user baselines, and weighted ZTA risk scoring.

Generates ~5000-10000 records across 50-100 users over 30 days.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import os

# --- Configuration ---
NUM_USERS = 75
DAYS = 30
START_DATE = datetime(2024, 1, 1)

LOCATIONS = ['Jakarta', 'Surabaya', 'Bandung', 'Singapore', 'London', 'New York', 'Tokyo']
DEVICES = ['MacBook-Pro', 'ThinkPad-T14', 'iPhone-13', 'Galaxy-S22', 'iPad-Pro']
ROLES = ['admin', 'staff', 'staff', 'staff', 'guest']
ACTIVITY_TYPES = ['login', 'file_access', 'download', 'upload', 'logout']
RESOURCES = ['server', 'database', 'internal_tool', 'admin_panel', 'public_docs']

# --- Helper probability ---
def get_random_time(start_hour, end_hour):
    h = random.randint(start_hour, end_hour - 1)
    m = random.randint(0, 59)
    s = random.randint(0, 59)
    return timedelta(hours=h, minutes=m, seconds=s)

# --- 1. Generate User Baselines ---
# Every user has a fixed primary location, device, role, and typical shift
users_baseline = {}
for i in range(1, NUM_USERS + 1):
    role = random.choice(ROLES)
    users_baseline[f"USR_{i:03d}"] = {
        "role": role,
        "primary_location": random.choice(LOCATIONS[:3] if role != 'guest' else LOCATIONS),
        "primary_device": random.choice(DEVICES),
        "typical_start_hour": random.randint(7, 10),
        "typical_session_min": random.randint(15, 120)
    }

# --- 2. Generate Temporal Data ---
records = []

for user_id, base in users_baseline.items():
    # Each user logs in 1-4 times per day realistically
    for day in range(DAYS):
        current_date = START_DATE + timedelta(days=day)
        
        # Skip some days randomly (e.g. weekends)
        if current_date.weekday() >= 5 and random.random() < 0.7:
            continue
            
        num_sessions = random.randint(1, 3)
        for _ in range(num_sessions):
            # Normal behavior initialization
            timestamp = current_date + get_random_time(base["typical_start_hour"], base["typical_start_hour"] + 8)
            device = base["primary_device"]
            location = base["primary_location"]
            duration = base["typical_session_min"] * 60 + random.randint(-300, 300) # seconds
            activity = random.choice(ACTIVITY_TYPES)
            
            # Roles dictate available resources
            if base['role'] == 'admin':
                resource = random.choice(RESOURCES)
            elif base['role'] == 'staff':
                resource = random.choice(['database', 'internal_tool', 'public_docs'])
            else:
                resource = 'public_docs'
            
            anomaly_type = "None"
            is_anomaly = 0
            
            # --- 3. Inject Anomalies (15% chance) ---
            if random.random() < 0.15:
                is_anomaly = 1
                anomaly_choice = random.choice(['behavioral', 'temporal', 'location', 'privilege', 'session'])
                anomaly_type = anomaly_choice
                
                if anomaly_choice == 'behavioral':
                    device = random.choice([d for d in DEVICES if d != base["primary_device"]])
                elif anomaly_choice == 'temporal':
                    timestamp = current_date + get_random_time(1, 4) # Midnight 1 AM - 4 AM
                elif anomaly_choice == 'location':
                    location = random.choice([l for l in LOCATIONS if l != base["primary_location"]])
                elif anomaly_choice == 'privilege':
                    if base['role'] != 'admin':
                        resource = 'admin_panel'
                elif anomaly_choice == 'session':
                    duration = random.choice([random.randint(1, 45), random.randint(36000, 72000)]) # < 1m or > 10hrs

            records.append({
                "user_id": user_id,
                "timestamp": timestamp,
                "device_id": device,
                "location": location,
                "user_role": base['role'],
                "activity_type": activity,
                "resource_accessed": resource,
                "session_duration": max(1, duration),
                "is_anomaly": is_anomaly,
                "anomaly_type": anomaly_type,
                "base_device": base["primary_device"],
                "base_location": base["primary_location"]
            })

# --- 4. Process Sequence and Feature Engineering ---
df = pd.DataFrame(records)
# Sort strictly by time per user to maintain time-series integrity
df = df.sort_values(by=["user_id", "timestamp"]).reset_index(drop=True)

# Feature flags
df['login_hour'] = df['timestamp'].dt.hour
df['device_change_flag'] = (df['device_id'] != df['base_device']).astype(int)
df['location_change_flag'] = (df['location'] != df['base_location']).astype(int)
df['midnight_login_flag'] = df['login_hour'].apply(lambda h: 1 if 0 <= h <= 5 else 0)
df['short_session_flag'] = (df['session_duration'] < 60).astype(int)

# Activity spike simulation (more than 5 actions within last 1 hour for a user)
# For simplicity in this mock, we just create a stochastic high_activity_flag based on temporal anomaly
df['high_activity_flag'] = df['anomaly_type'].apply(lambda x: 1 if x == 'behavioral' and random.random() > 0.5 else 0)

# Clean up baseline helper columns
df = df.drop(columns=['base_device', 'base_location'])

# --- 5. ZTA Risk Scoring ---
def calculate_risk(row):
    score = 0.0
    if row['device_change_flag']: score += 0.2
    if row['location_change_flag']: score += 0.2
    if row['midnight_login_flag']: score += 0.2
    if row['high_activity_flag']: score += 0.2
    if row['short_session_flag']: score += 0.2
    
    # Privilege escalation gets a massive bump
    if row['user_role'] != 'admin' and row['resource_accessed'] == 'admin_panel':
        score += 0.4
        
    return min(1.0, round(score, 2))

df['risk_score'] = df.apply(calculate_risk, axis=1)

# Ensure ground truth matches score logic
df['is_anomaly'] = (df['risk_score'] > 0).astype(int)

# Ensure anomaly_type is accurate for derived 
df.loc[(df['is_anomaly'] == 1) & (df['anomaly_type'] == 'None'), 'anomaly_type'] = 'compound'

# --- 6. Save Output ---
out_dir = "../datasets"
os.makedirs(out_dir, exist_ok=True)
out_file = os.path.join(out_dir, "dataset_advanced_zta.csv")

df.to_csv(out_file, index=False)

print(f"✅ Generated Advanced ZTA Dataset: {len(df)} records")
print(f"✅ Total Users: {df['user_id'].nunique()}")
print(f"✅ Anomaly Ratio: {(df['is_anomaly'].mean() * 100):.2f}%")
print(f"✅ File saved to: {out_file}")
