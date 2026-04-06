import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

def simulate_network_logs(n=1000):
    """Network Intrusion Simulation (Kaggle-like)"""
    data = []
    protocols = ['TCP', 'UDP', 'ICMP']
    attacks = [0, 0, 0, 0, 0, 1] # 1 in 6 is an attack
    
    for _ in range(n):
        data.append({
            'src_ip': f"192.168.1.{random.randint(10, 254)}",
            'dst_ip': "10.0.0.1",
            'protocol': random.choice(protocols),
            'duration': random.uniform(0.1, 50.0),
            'attack': random.choice(attacks)
        })
    return pd.DataFrame(data)

def simulate_behavior_logs(n=1000):
    """BETH Dataset Simulation (User Behavior)"""
    data = []
    users = [f"USER_{idx:03d}" for idx in range(1, 51)]
    devices = ['Workstation-01', 'Mobile-MDM', 'Laptop-VPN', 'Unknown-Terminal']
    locations = ['San Francisco', 'London', 'Singapore', 'North Korea (Suspicious)', 'Unknown']
    activities = ['SAML_Login', 'File_Modify', 'API_Auth', 'Sudo_Request', 'DB_Query']
    
    start_time = datetime.now() - timedelta(days=7)
    
    for _ in range(n):
        user = random.choice(users)
        ts = start_time + timedelta(seconds=random.randint(0, 604800))
        data.append({
            'user_id': user,
            'timestamp': ts,
            'activity_type': random.choice(activities),
            'device': random.choice(devices),
            'location': random.choice(locations)
        })
    return pd.DataFrame(data)

def simulate_social_logs(n=1000):
    """Social Media Activity Simulation"""
    data = []
    users = [f"USER_{idx:03d}" for idx in range(1, 51)]
    platforms = ['LinkedIn-Sales', 'Slack-General', 'Discord-Dev', 'Reddit-Research']
    
    for _ in range(n):
        data.append({
            'user_id': random.choice(users),
            'platform_usage': random.choice(platforms),
            'session_duration': random.uniform(5.0, 300.0)
        })
    return pd.DataFrame(data)

def standardize_and_merge():
    """Merge all 3 sources into the requested Unified ZTA Schema"""
    print("[Pipeline] Starting Ingestion...")
    net_df = simulate_network_logs(2000)
    beh_df = simulate_behavior_logs(2000)
    soc_df = simulate_social_logs(2000)
    
    print("[Pipeline] Standardizing Sources...")
    
    # 1. Start with Behavior as base
    unified = beh_df.copy()
    unified = unified.rename(columns={'device': 'device_id'})
    
    # 2. Integrate Social (average duration per user)
    soc_avg = soc_df.groupby('user_id')['session_duration'].mean().reset_index()
    unified = pd.merge(unified, soc_avg, on='user_id', how='left')
    
    # 3. Integrate Network (assign random traffic log samples)
    # Since they don't have a direct key in logs, we'll simulate the traffic metadata
    unified['network_traffic'] = [
        f"{net_df.iloc[random.randint(0, 1999)]['src_ip']} -> {net_df.iloc[random.randint(0, 1999)]['protocol']}"
        for _ in range(len(unified))
    ]
    
    # 4. Final Ground Truth (is_anomaly)
    # Anomaly if: Location is North Korea OR Activity is Sudo_Request AND Duration > 100
    unified['is_anomaly'] = unified.apply(
        lambda r: 1 if (r['location'] == 'North Korea (Suspicious)' or 
                       (r['activity_type'] == 'Sudo_Request' and r['session_duration'] > 150)) 
        else 0, axis=1
    )
    
    # Extra columns for backend compatibility
    unified['activity_count'] = [random.randint(10, 1000) for _ in range(len(unified))]
    unified['device_type'] = unified['device_id']
    unified['access_resource'] = unified['activity_type']
    
    # Final cleanup of columns to match request
    final_cols = [
        'user_id', 'timestamp', 'device_id', 'device_type', 'location', 
        'activity_type', 'access_resource', 'session_duration', 'network_traffic', 
        'is_anomaly', 'activity_count'
    ]
    
    # Add predicted_anomaly placeholder for frontend
    unified['zta_decision'] = 'ALLOW' 
    
    print(f"[Pipeline] Finalized dataset with {len(unified)} records.")
    return unified[final_cols]

if __name__ == "__main__":
    df = standardize_and_merge()
    df.to_csv("unified_zta_dataset.csv", index=False)
    print("[Pipeline] SUCCESS: unified_zta_dataset.csv created.")
