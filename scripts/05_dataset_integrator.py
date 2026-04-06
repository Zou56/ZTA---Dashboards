"""
05_dataset_integrator.py
========================
Integrates Network Intrusion, BETH User Behavior, and Social Media activity datasets.
Standardizes schema, performs feature engineering, and calculates ZTA risk scores.
"""

import pandas as pd
import numpy as np
import os
import random
from datetime import datetime, timedelta

# --- Configuration ---
NUM_USERS = 100
RECORDS_PER_USER = 50
TOTAL_RECORDS = NUM_USERS * RECORDS_PER_USER
OUTPUT_FILE = "../datasets/integrated_zta_dataset.csv"

# --- 1. Ingestion: Simulated Data Generation ---

def generate_network_data():
    """Simulates Network Intrusion Dataset."""
    protocols = ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS']
    attacks = ['normal', 'normal', 'normal', 'normal', 'dos', 'bruteforce', 'probe']
    
    data = {
        'src_ip': [f"192.168.1.{random.randint(1, 200)}" for _ in range(TOTAL_RECORDS)],
        'dst_ip': [f"10.0.0.{random.randint(1, 50)}" for _ in range(TOTAL_RECORDS)],
        'protocol': [random.choice(protocols) for _ in range(TOTAL_RECORDS)],
        'duration': [random.randint(0, 1000) for _ in range(TOTAL_RECORDS)],
        'attack': [random.choice(attacks) if random.random() < 0.15 else 'normal' for _ in range(TOTAL_RECORDS)]
    }
    return pd.DataFrame(data)

def generate_user_behavior_data():
    """Simulates BETH User Behavior Dataset."""
    locations = ['Jakarta', 'Medan', 'Surabaya', 'Singapore', 'London', 'Berlin']
    devices = ['Workstation_01', 'Mobile_Android', 'Mobile_iOS', 'ThinkPad_X1', 'MacBook_Air']
    activities = ['file_access', 'login', 'logout', 'download', 'upload']
    
    data = {
        'user_id': [f"USR_{i//RECORDS_PER_USER:03d}" for i in range(TOTAL_RECORDS)],
        'timestamp': [datetime(2025, 3, 1) + timedelta(minutes=random.randint(0, 43200)) for _ in range(TOTAL_RECORDS)],
        'activity_type': [random.choice(activities) for _ in range(TOTAL_RECORDS)],
        'device': [random.choice(devices) for _ in range(TOTAL_RECORDS)],
        'location': [random.choice(locations) for _ in range(TOTAL_RECORDS)]
    }
    
    # --- Improvement: Establish user behavior baselines ---
    df = pd.DataFrame(data)
    for user in df['user_id'].unique():
        user_mask = df['user_id'] == user
        base_device = random.choice(devices)
        base_loc = random.choice(locations)
        # Most events should follow baseline (85%)
        df.loc[user_mask, 'device'] = df.loc[user_mask, 'device'].apply(lambda x: x if random.random() < 0.15 else base_device)
        df.loc[user_mask, 'location'] = df.loc[user_mask, 'location'].apply(lambda x: x if random.random() < 0.1 else base_loc)
        
    return df

def generate_social_media_data():
    """Simulates Social Media Activity Dataset."""
    platforms = ['LinkedIn', 'Twitter', 'Slack', 'Teams', 'GitHub']
    
    data = {
        'user_id': [f"USR_{i//RECORDS_PER_USER:03d}" for i in range(TOTAL_RECORDS)],
        'activity_time': [datetime(2025, 3, 1) + timedelta(minutes=random.randint(0, 43200)) for _ in range(TOTAL_RECORDS)],
        'session_duration': [random.randint(60, 3600) for _ in range(TOTAL_RECORDS)],
        'platform_usage': [random.choice(platforms) for _ in range(TOTAL_RECORDS)]
    }
    return pd.DataFrame(data)

# --- EXECUTION START ---

print("🚀 Starting Data Ingestion...")
df_net = generate_network_data()
df_beh = generate_user_behavior_data()
df_soc = generate_social_media_data()

# --- 2. Standardization ---

print("🔄 Standardizing Datasets...")

# Map src_ip to user_id (Create synthetic mapping)
ip_to_user = {ip: f"USR_{random.randint(0, NUM_USERS-1):03d}" for ip in df_net['src_ip'].unique()}
df_net['user_id'] = df_net['src_ip'].map(ip_to_user)

# Standardization Rules: Map columns to Unified Schema
# Columns: user_id | timestamp | device_id | location | activity_type | session_duration | network_activity_flag | attack_label

# Behavior Data mapping (Main base)
df_unified = df_beh.copy()
df_unified.rename(columns={'device': 'device_id'}, inplace=True)

# Merge Network Data info (summarized or flags)
# For simplicity in this unified dataset, we merge network flags per record
df_unified['network_activity_flag'] = 1
df_unified['attack_label'] = df_net['attack'] # Stochastic mapping for demo

# Merge Social Media info
df_unified['session_duration'] = df_soc['session_duration']
df_unified['platform_usage'] = df_soc['platform_usage']

# ISO Timestamps
df_unified['timestamp'] = pd.to_datetime(df_unified['timestamp']).dt.strftime('%Y-%m-%dT%H:%M:%SZ')

# --- 3. Feature Engineering ---

print("🛠️ Engineering Features...")

df_unified['timestamp_dt'] = pd.to_datetime(df_unified['timestamp'])
df_unified['login_hour'] = df_unified['timestamp_dt'].dt.hour

# Baseline for change detection (first device/location per user)
baselines = df_unified.groupby('user_id').first()[['device_id', 'location']].reset_index()
baselines.columns = ['user_id', 'base_device', 'base_location']
df_unified = df_unified.merge(baselines, on='user_id', how='left')

df_unified['device_change_flag'] = (df_unified['device_id'] != df_unified['base_device']).astype(int)
df_unified['location_change_flag'] = (df_unified['location'] != df_unified['base_location']).astype(int)
df_unified['midnight_login_flag'] = df_unified['login_hour'].apply(lambda h: 1 if 0 <= h <= 5 else 0)
df_unified['high_activity_flag'] = [1 if random.random() < 0.03 else 0 for _ in range(len(df_unified))]
df_unified['short_session_flag'] = (df_unified['session_duration'] < 120).astype(int)
df_unified['network_anomaly_flag'] = (df_unified['attack_label'] != 'normal').astype(int)

# --- 4 & 5. Ground Truth & Risk Scoring ---

print("⚖️ Calculating Risk Scores and Labels...")

# risk_score = network_anomaly*0.3 + device_change*0.2 + location_change*0.2 + midnight_login*0.1 + high_activity*0.1 + short_session*0.1
def calculate_risk(row):
    score = (
        row['network_anomaly_flag'] * 0.3 +
        row['device_change_flag'] * 0.2 +
        row['location_change_flag'] * 0.2 +
        row['midnight_login_flag'] * 0.1 +
        row['high_activity_flag'] * 0.1 +
        row['short_session_flag'] * 0.1
    )
    return round(min(1.0, score), 3)

df_unified['risk_score'] = df_unified.apply(calculate_risk, axis=1)

# is_anomaly = 1 if attack_label != normal OR any flag = 1
# To ensure 10-20% ratio, using a combination of flags on risk threshold
df_unified['is_anomaly'] = df_unified['risk_score'].apply(lambda s: 1 if s >= 0.3 else 0)

# --- Bonus: Anomaly Type ---
def get_anomaly_type(row):
    if row['is_anomaly'] == 0: return 'None'
    if row['network_anomaly_flag']: return 'network'
    if row['device_change_flag'] or row['location_change_flag']: return 'location'
    if row['midnight_login_flag']: return 'temporal'
    return 'behavioral'

df_unified['anomaly_type'] = df_unified.apply(get_anomaly_type, axis=1)

# Clean up baseline columns
df_final = df_unified.drop(columns=['base_device', 'base_location', 'timestamp_dt'])

# --- 6. Output ---

print(f"💾 Saving to {OUTPUT_FILE}...")
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
df_final.to_csv(OUTPUT_FILE, index=False)

# Final Metrics
ratio = df_final['is_anomaly'].mean() * 100
print(f"✅ Integration Complete!")
print(f"📊 Total Records: {len(df_final)}")
print(f"📊 Anomaly Ratio: {ratio:.2f}% (Target: 10-20%)")
print(f"📊 Risk Score Avg: {df_final['risk_score'].mean():.3f}")
print(f"📂 File: {os.path.abspath(OUTPUT_FILE)}")
