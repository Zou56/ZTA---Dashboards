"""
utils.py
────────
Data loading, feature engineering, and preprocessing utilities.
Used by the FastAPI backend for the ZTA Anomaly Detection Dashboard.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
import io


# ─── Feature column definitions ──────────────────────────────────────────────
FLAG_COLS = [
    "device_change_flag",
    "location_change_flag",
    "midnight_login_flag",
    "high_activity_flag",
    "short_session_flag",
]

FEATURE_COLS = [
    "session_duration",
    "activity_count",
    "login_hour",
    "device_change_flag",
    "location_change_flag",
    "midnight_login_flag",
    "high_activity_flag",
    "short_session_flag",
    "device_type_enc",
    "access_resource_enc",
    "location_enc",
]


def load_and_process(file_bytes: bytes) -> pd.DataFrame:
    """Load CSV from bytes and preprocess."""
    df = pd.read_csv(io.BytesIO(file_bytes), parse_dates=["timestamp"])
    return process_dataframe(df)


def process_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Standard preprocessing for any ZTA dataframe (upload or simulated).
    Ensures flags are derived and categorical features are encoded.
    """
    df = df.copy()

    # ── Compatibility Mapping ────────────────────────────────────────────────
    if "device_id" in df.columns and "device_type" not in df.columns:
        df["device_type"] = df["device_id"]
    if "resource_accessed" in df.columns and "access_resource" not in df.columns:
        df["access_resource"] = df["resource_accessed"]
    if "activity_type" in df.columns and "access_resource" not in df.columns:
        # For simulated data
        df["access_resource"] = df["activity_type"]

    if "activity_count" not in df.columns:
        df["activity_count"] = 45

    # ── Derive flags if missing ──────────────────────────────────────────────
    if not all(c in df.columns for c in FLAG_COLS):
        df = _derive_flags(df)

    # ── login_hour ────────────────────────────────────────────────────────────
    if "timestamp" in df.columns:
        df["login_hour"] = pd.to_datetime(df["timestamp"]).dt.hour

    # ── Ground truth label ────────────────────────────────────────────────────
    if "is_anomaly" not in df.columns:
        df["is_anomaly"] = df[FLAG_COLS].any(axis=1).astype(int)

    # ── Label encode categoricals ────────────────────────────────────────────
    le_device   = LabelEncoder()
    le_resource = LabelEncoder()
    le_location = LabelEncoder()

    df["device_type_enc"]     = le_device.fit_transform(df["device_type"].astype(str))
    df["access_resource_enc"] = le_resource.fit_transform(df["access_resource"].astype(str))
    df["location_enc"]        = le_location.fit_transform(df["location"].astype(str))

    return df


def _derive_flags(df: pd.DataFrame) -> pd.DataFrame:
    """Derive anomaly flag columns from raw data if they are missing."""
    df = df.copy()

    # Device change: mode per user
    user_device_map = (
        df.groupby("user_id")["device_type"]
          .agg(lambda x: x.mode()[0])
          .to_dict()
    )
    df["device_change_flag"] = df.apply(
        lambda r: 1 if r["device_type"] != user_device_map.get(r["user_id"], r["device_type"]) else 0,
        axis=1,
    )

    # Login hour
    df["login_hour"] = pd.to_datetime(df["timestamp"]).dt.hour
    df["midnight_login_flag"] = df["login_hour"].apply(lambda h: 1 if 0 <= h <= 5 else 0)

    # Sort for shift-based location flag
    df = df.sort_values(["user_id", "timestamp"]).reset_index(drop=True)
    df["location_change_flag"] = (
        df.groupby("user_id")["location"]
          .apply(lambda x: (x != x.shift()).astype(int))
          .reset_index(level=0, drop=True)
    )

    df["high_activity_flag"] = df["activity_count"].apply(lambda c: 1 if c > 500 else 0)
    df["short_session_flag"] = df["session_duration"].apply(lambda s: 1 if s < 1.0 else 0)

    return df


def prepare_features(df: pd.DataFrame):
    """
    Extract and scale feature matrix X and label vector y.
    Returns: (X_scaled, y, scaler, feature_names)
    """
    X = df[FEATURE_COLS].copy()
    y = df["is_anomaly"].values

    scaler   = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return X_scaled, y, scaler, FEATURE_COLS


def normalize_scores(raw_scores: np.ndarray) -> np.ndarray:
    """
    Convert sklearn decision_function scores (lower = anomaly) to
    a [0, 1] anomaly probability (higher = more anomalous).
    """
    s_min, s_max = raw_scores.min(), raw_scores.max()
    if s_max == s_min:
        return np.zeros_like(raw_scores)
    return 1.0 - (raw_scores - s_min) / (s_max - s_min)


def zta_decision(score: float) -> str:
    """Apply Zero Trust decision rules based on anomaly score."""
    if score > 0.70:
        return "DENY"
    elif score >= 0.50:
        return "VERIFY"
    return "ALLOW"


def get_summary_stats(df: pd.DataFrame) -> dict:
    """Return high-level stats about the dataset."""
    return {
        "total_rows":   int(len(df)),
        "total_users":  int(df["user_id"].nunique()),
        "date_range": {
            "start": str(df["timestamp"].min()),
            "end":   str(df["timestamp"].max()),
        },
        "columns": list(df.columns),
    }
