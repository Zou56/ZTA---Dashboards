"""
bot_service.py
──────────────
Telegram Bot service for ZTA Anomaly Detection alerts.
Simulates an "AI SOC Analyst" providing natural language explanations.
"""

import os
import asyncio
from typing import Optional
from telegram import Bot
from telegram.constants import ParseMode
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Simple config load (using env or defaults)
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

class AISecurityAnalyst:
    """
    Simulates a GPT-like AI security analyst that generates
    plain-language explanations for ZTA anomalies.
    """
    
    @staticmethod
    def analyze_anomaly(row: dict) -> str:
        """Generate a natural language explanation for an anomaly."""
        user = row.get("user_id", "Unknown User")
        score = row.get("anomaly_score", 0)
        decision = row.get("zta_decision", "ALLOW")
        location = row.get("location", "Unknown Location")
        device = row.get("device_type", "Unknown Device")
        
        # Determine the "Reason" based on flags
        reasons = []
        if row.get("device_change_flag"):   reasons.append("unusual device swap")
        if row.get("location_change_flag"): reasons.append(f"impossible travel from {location}")
        if row.get("midnight_login_flag"):  reasons.append("suspicious login hour (midnight)")
        if row.get("high_activity_flag"):   reasons.append("burst in activity count")
        if row.get("short_session_flag"):   reasons.append("abnormally short session")
        
        if not reasons:
            reasons.append("unusual behavioral pattern detected by Isolation Forest")
            
        reason_str = ", ".join(reasons)
        
        return (
            f"🔍 *AI Analyst Insight:*\n"
            f"User *{user}* was flagged with a risk score of *{score:.3f}*. "
            f"The primary driver is *{reason_str}*. "
            f"Per ZTA policy, this session is marked as *{decision}*."
        )

class TelegramBot:
    """Handles async communication with Telegram API."""
    
    def __init__(self, token: str = TOKEN, chat_id: str = CHAT_ID):
        self.token = token
        self.chat_id = chat_id
        self.is_enabled = bool(token and chat_id)
        
    async def send_alert(self, row: dict):
        """Sends a formatted alert and AI analysis to the configured chat."""
        if not self.is_enabled:
            print(f"[BOT-MOCK] Alert would be sent for {row['user_id']}: Decision {row['zta_decision']}")
            return

        try:
            bot = Bot(token=self.token)
            ai = AISecurityAnalyst()
            explanation = ai.analyze_anomaly(row)
            
            message = (
                f"🚨 *ZTA SECURITY ALERT* 🚨\n"
                f"━━━━━━━━━━━━━━━━━━━━\n"
                f"📌 *User:* `{row['user_id']}`\n"
                f"📍 *Location:* {row['location']}\n"
                f"💻 *Device:* {row['device_type']}\n"
                f"📊 *Risk Score:* `{row['anomaly_score']:.3f}`\n"
                f"🛡️ *Policy:* `{row['zta_decision']}`\n"
                f"━━━━━━━━━━━━━━━━━━━━\n"
                f"{explanation}"
            )
            
            await bot.send_message(
                chat_id=self.chat_id,
                text=message,
                parse_mode=ParseMode.MARKDOWN
            )
            print(f"[BOT] Alert successfully sent to Telegram for {row['user_id']}")
            
        except Exception as e:
            print(f"[BOT-ERROR] Failed to send Telegram alert: {str(e)}")

# Singleton instance
telegram_bot = TelegramBot()
