"""
main.py
───────
FastAPI application — ZTA Anomaly Detection Dashboard Backend
Endpoints: auth, upload, data, train, predict, metrics, logs, export
"""

import os
import sqlite3
import time
import json
from datetime import datetime
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

import numpy as np
import pandas as pd
import random
import string
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import io

from utils import load_and_process, prepare_features, zta_decision, get_summary_stats
from model import detector
from bot_service import telegram_bot

# ─── Application setup ────────────────────────────────────────────────────────
app = FastAPI(
    title="ZTA Anomaly Detection API",
    description="Big Data Analytics + Zero Trust Architecture — Research Dashboard",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Simple admin auth ────────────────────────────────────────────────────────
ADMIN_CREDENTIALS = {"username": "admin", "password": "admin123"}
VALID_TOKEN       = "zta-admin-token-2024"
security          = HTTPBearer(auto_error=False)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials or credentials.credentials != VALID_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized — invalid token")
    return credentials.credentials

# ─── SQLite API log setup ─────────────────────────────────────────────────────
DB_PATH = Path(__file__).parent / "api_logs.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS api_logs (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            method    TEXT,
            endpoint  TEXT,
            status    INTEGER,
            duration  REAL,
            user      TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

def log_request(method: str, endpoint: str, status: int,
                duration: float, user: str = "admin"):
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO api_logs (timestamp, method, endpoint, status, duration, user) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        (datetime.utcnow().isoformat(), method, endpoint, status, round(duration, 3), user),
    )
    conn.commit()
    conn.close()

# ─── In-memory application state ─────────────────────────────────────────────
state: dict = {
    "df":          None,   # processed DataFrame
    "X_scaled":    None,
    "y":           None,
    "scaler":      None,
    "features":    None,
    "predictions": None,   # DataFrame of predictions + ZTA decisions
    "metrics":     None,
}

# ─── Pydantic schemas ─────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    username: str
    message: str

class BotConfig(BaseModel):
    token: str
    chat_id: str
    enabled: bool

# ══════════════════════════════════════════════════════════════════════════════
#  AUTH
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/auth/login", response_model=LoginResponse, tags=["Auth"])
async def login(body: LoginRequest, request: Request):
    t0 = time.time()
    if (body.username != ADMIN_CREDENTIALS["username"] or
            body.password != ADMIN_CREDENTIALS["password"]):
        log_request("POST", "/auth/login", 401, time.time() - t0, body.username)
        raise HTTPException(status_code=401, detail="Invalid credentials")

    log_request("POST", "/auth/login", 200, time.time() - t0, body.username)
    return LoginResponse(
        token    = VALID_TOKEN,
        username = body.username,
        message  = "Login successful",
    )

# ══════════════════════════════════════════════════════════════════════════════
#  UPLOAD
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/upload", tags=["Data"])
async def upload_dataset(
    file: UploadFile = File(...),
    token: str = Depends(verify_token),
):
    """Upload a CSV dataset. Processes features and stores in memory."""
    t0 = time.time()
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    contents = await file.read()
    try:
        df = load_and_process(contents)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Processing error: {str(e)}")

    X_scaled, y, scaler, features = prepare_features(df)

    state["df"]       = df
    state["X_scaled"] = X_scaled
    state["y"]        = y
    state["scaler"]   = scaler
    state["features"] = features
    # Reset model state when new data is uploaded
    state["predictions"] = None
    state["metrics"]     = None
    detector.is_trained  = False

    stats = get_summary_stats(df)
    log_request("POST", "/upload", 200, time.time() - t0)
    return {
        "success":  True,
        "filename": file.filename,
        "rows":     stats["total_rows"],
        "users":    stats["total_users"],
        "columns":  stats["columns"],
        "message":  f"Dataset uploaded — {stats['total_rows']} rows processed.",
    }

# ══════════════════════════════════════════════════════════════════════════════
#  DATA
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/data", tags=["Data"])
async def get_data(
    page: int = 1,
    limit: int = 50,
    token: str = Depends(verify_token),
):
    """Return paginated processed dataset."""
    t0 = time.time()
    if state["df"] is None:
        raise HTTPException(status_code=404, detail="No dataset loaded. Upload first.")

    df   = state["df"]
    total = len(df)
    start = (page - 1) * limit
    end   = start + limit

    # Merge predictions if available
    if state["predictions"] is not None:
        merged = df.copy()
        pred_df = state["predictions"]
        for col in ["anomaly_score", "predicted_anomaly", "zta_decision"]:
            if col in pred_df.columns:
                merged[col] = pred_df[col].values
        slice_df = merged.iloc[start:end]
    else:
        slice_df = df.iloc[start:end]

    # Convert timestamps to string for JSON serialization
    slice_out = slice_df.copy()
    if "timestamp" in slice_out.columns:
        slice_out["timestamp"] = slice_out["timestamp"].astype(str)

    log_request("GET", "/data", 200, time.time() - t0)
    return {
        "total": total,
        "page":  page,
        "limit": limit,
        "pages": -(-total // limit),   # ceiling div
        "data":  slice_out.replace({np.nan: None}).to_dict(orient="records"),
    }

# ══════════════════════════════════════════════════════════════════════════════
#  TRAIN
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/train", tags=["Model"])
async def train_model(token: str = Depends(verify_token)):
    """Train the Isolation Forest model on the loaded dataset."""
    t0 = time.time()
    if state["X_scaled"] is None:
        raise HTTPException(status_code=404, detail="No dataset loaded. Upload first.")

    summary = detector.train(state["X_scaled"])
    log_request("POST", "/train", 200, time.time() - t0)
    return {
        "success": True,
        "message": "Isolation Forest trained successfully.",
        **summary,
    }

# ══════════════════════════════════════════════════════════════════════════════
#  PREDICT
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/predict", tags=["Model"])
async def get_predictions(
    background_tasks: BackgroundTasks,
    token: str = Depends(verify_token)
):
    """Run model inference and return predictions with ZTA decisions."""
    t0 = time.time()
    if state["X_scaled"] is None:
        raise HTTPException(status_code=404, detail="No dataset. Upload first.")
    if not detector.is_trained:
        raise HTTPException(status_code=400, detail="Model not trained. Call /train first.")

    scores, preds = detector.predict(state["X_scaled"])

    df = state["df"].copy()
    df["anomaly_score"]     = np.round(scores, 4)
    df["predicted_anomaly"] = preds
    df["zta_decision"]      = [zta_decision(s) for s in scores]
    df["timestamp"]         = df["timestamp"].astype(str)

    state["predictions"] = df[["anomaly_score", "predicted_anomaly", "zta_decision"]]

    # Evaluate metrics
    state["metrics"] = detector.evaluate(state["y"])

    # TRIGGER TELEGRAM ALERTS FOR HIGH-RISK EVENTS (Sampled for research demo)
    if os.getenv("ALERTS_ENABLED") == "true":
        high_risk = df[df["zta_decision"] != "ALLOW"].tail(5).to_dict(orient="records")
        for alert_row in high_risk:
            background_tasks.add_task(telegram_bot.send_alert, alert_row)

    output_cols = [
        "user_id", "timestamp", "ip_address", "location",
        "device_type", "login_status", "session_duration",
        "access_resource", "activity_count", "login_hour",
        "is_anomaly", "anomaly_score", "predicted_anomaly", "zta_decision",
    ]
    out_cols = [c for c in output_cols if c in df.columns]
    result_df = df[out_cols]

    log_request("GET", "/predict", 200, time.time() - t0)
    return {
        "total":       len(result_df),
        "predictions": result_df.replace({np.nan: None}).to_dict(orient="records"),
    }

# ══════════════════════════════════════════════════════════════════════════════
#  SIMULATE ATTACK
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/simulate-attack", tags=["Demo"])
async def simulate_attack(token: str = Depends(verify_token)):
    """Inject a simulated attack (anomaly) into the dataset for live demonstration."""
    if state["df"] is None:
        raise HTTPException(status_code=400, detail="Upload a dataset first.")

    df = state["df"]
    
    # Create a completely anomalous record
    malicious_user = f"ATTACK_{random.randint(100, 999)}"
    
    attack_row = {
        "user_id": malicious_user,
        "timestamp": datetime.now(),
        "device_type": "Unknown-Kali-Linux",
        "location": "North Korea (Simulated)",
        "activity_count": random.randint(1000, 5000),
        "session_duration": random.randint(1, 5), # extremely short
        "login_status": "success",
        "access_resource": "root_shell_api",
        "device_change_flag": 1,
        "location_change_flag": 1,
        "midnight_login_flag": 1,
        "high_activity_flag": 1,
        "short_session_flag": 1,
        "device_type_enc": random.randint(10, 99),
        "access_resource_enc": random.randint(10, 99),
        "location_enc": random.randint(10, 99),
        "login_hour": 3 # 3 AM
    }
    
    # Fill any missing columns with blanks to match df schema
    for col in df.columns:
        if col not in attack_row:
            attack_row[col] = df[col].iloc[0] if len(df) > 0 else 0
            
    # Append to dataframe and rebuild features
    from utils import prepare_features
    new_df = pd.concat([df, pd.DataFrame([attack_row])], ignore_index=True)
    state["df"] = new_df
    X_scaled, y, scaler, features = prepare_features(new_df)
    state["X_scaled"] = X_scaled
    state["y"] = y
    
    return {"message": f"Malicious record injected for user {malicious_user}. Retrain and re-run detection.", "user_id": malicious_user}

# ══════════════════════════════════════════════════════════════════════════════
#  METRICS
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/metrics", tags=["Model"])
async def get_metrics(token: str = Depends(verify_token)):
    """Return model performance metrics."""
    t0 = time.time()
    if state["metrics"] is None:
        raise HTTPException(status_code=404,
                            detail="No metrics yet. Run /predict first.")

    m = state["metrics"]
    df = state["df"]
    log_request("GET", "/metrics", 200, time.time() - t0)
    return {
        **m,
        "total_users": int(df["user_id"].nunique()),
        "total_rows":  int(len(df)),
    }

# ══════════════════════════════════════════════════════════════════════════════
#  LOGS
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/logs", tags=["Admin"])
async def get_logs(
    limit: int = 100,
    token: str = Depends(verify_token),
):
    """Return recent API request logs from SQLite."""
    t0 = time.time()
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT * FROM api_logs ORDER BY id DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    cols = ["id", "timestamp", "method", "endpoint", "status", "duration", "user"]
    logs = [dict(zip(cols, r)) for r in rows]
    log_request("GET", "/logs", 200, time.time() - t0)
    return {"total": len(logs), "logs": logs}

# ══════════════════════════════════════════════════════════════════════════════
#  EXPORT
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/export", tags=["Data"])
async def export_predictions(token: str = Depends(verify_token)):
    """Download the full predictions dataset as CSV."""
    t0 = time.time()
    if state["df"] is None:
        raise HTTPException(status_code=404, detail="No dataset loaded.")
    if state["predictions"] is None:
        raise HTTPException(status_code=404, detail="No predictions. Run /predict first.")

    df          = state["df"].copy()
    pred_df     = state["predictions"]
    for col in ["anomaly_score", "predicted_anomaly", "zta_decision"]:
        if col in pred_df.columns:
            df[col] = pred_df[col].values

    df["timestamp"] = df["timestamp"].astype(str)
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    buf.seek(0)

    log_request("GET", "/export", 200, time.time() - t0)
    return StreamingResponse(
        io.BytesIO(buf.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=dataset_with_predictions.csv"},
    )

@app.get("/bot/config", tags=["Admin"])
async def get_bot_config(token: str = Depends(verify_token)):
    """Return current bot configuration."""
    return {
        "token":   os.getenv("TELEGRAM_BOT_TOKEN", ""),
        "chat_id": os.getenv("TELEGRAM_CHAT_ID", ""),
        "enabled": os.getenv("ALERTS_ENABLED", "false") == "true",
    }

@app.post("/bot/config", tags=["Admin"])
async def update_bot_config(body: BotConfig, token: str = Depends(verify_token)):
    """Update bot configuration and reload the service."""
    os.environ["TELEGRAM_BOT_TOKEN"] = body.token
    os.environ["TELEGRAM_CHAT_ID"] = body.chat_id
    os.environ["ALERTS_ENABLED"] = "true" if body.enabled else "false"
    
    # Update singleton instance
    telegram_bot.token = body.token
    telegram_bot.chat_id = body.chat_id
    telegram_bot.is_enabled = body.enabled
    
    return {"success": True, "message": "Bot configuration updated."}

# ─── Health check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health():
    return {
        "status":        "ok",
        "dataset_loaded": state["df"] is not None,
        "model_trained":  detector.is_trained,
        "predictions_ready": state["predictions"] is not None,
    }
