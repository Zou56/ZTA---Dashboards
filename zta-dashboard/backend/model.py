"""
model.py
────────
Isolation Forest training, prediction, and evaluation logic.
Research: Big Data Analytics + Zero Trust Architecture
"""

import numpy as np
import pandas as pd
from sklearn.ensemble  import IsolationForest
from sklearn.metrics   import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix, roc_curve, auc,
)
from utils import normalize_scores, zta_decision


class AnomalyDetector:
    """
    Wrapper around sklearn IsolationForest with ZTA integration.
    Manages training, prediction, scoring, and evaluation.
    """

    def __init__(self, contamination: float = 0.15, random_state: int = 42):
        self.contamination  = contamination
        self.random_state   = random_state
        self.model          = None
        self.is_trained     = False

        # Stored after predict()
        self.anomaly_scores: np.ndarray | None = None
        self.predictions:    np.ndarray | None = None

    # ── Training ─────────────────────────────────────────────────────────────
    def train(self, X_scaled: np.ndarray) -> dict:
        """
        Fit the Isolation Forest on scaled feature matrix.
        Returns training summary dict.
        """
        self.model = IsolationForest(
            n_estimators  = 200,
            contamination = self.contamination,
            random_state  = self.random_state,
            n_jobs        = -1,
        )
        self.model.fit(X_scaled)
        self.is_trained = True

        return {
            "n_estimators":  200,
            "contamination": self.contamination,
            "n_samples":     int(X_scaled.shape[0]),
            "n_features":    int(X_scaled.shape[1]),
        }

    # ── Prediction ────────────────────────────────────────────────────────────
    def predict(self, X_scaled: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        """
        Run inference. Returns (anomaly_scores [0-1], binary_predictions [0/1]).
        Stores results in instance attributes.
        """
        if not self.is_trained:
            raise RuntimeError("Model not trained. Call train() first.")

        raw_scores       = self.model.decision_function(X_scaled)
        self.anomaly_scores = np.round(normalize_scores(raw_scores), 4)

        # sklearn predict: -1 = anomaly → recode to 1; 1 = normal → 0
        raw_pred         = self.model.predict(X_scaled)
        self.predictions = np.where(raw_pred == -1, 1, 0)

        return self.anomaly_scores, self.predictions

    # ── Metrics ───────────────────────────────────────────────────────────────
    def evaluate(self, y_true: np.ndarray) -> dict:
        """
        Compare predictions against ground-truth labels.
        Returns a comprehensive metrics dict.
        """
        if self.predictions is None or self.anomaly_scores is None:
            raise RuntimeError("Run predict() before evaluate().")

        y_pred = self.predictions
        scores = self.anomaly_scores

        acc  = float(accuracy_score(y_true, y_pred))
        prec = float(precision_score(y_true, y_pred, zero_division=0))
        rec  = float(recall_score(y_true, y_pred, zero_division=0))
        f1   = float(f1_score(y_true, y_pred, zero_division=0))

        cm           = confusion_matrix(y_true, y_pred)
        tn, fp, fn, tp = cm.ravel()

        fpr, tpr, _ = roc_curve(y_true, scores)
        roc_auc     = float(auc(fpr, tpr))

        zta_decisions = [zta_decision(s) for s in scores]
        zta_dist      = pd.Series(zta_decisions).value_counts().to_dict()

        n_total   = len(y_true)
        n_anomaly = int(y_true.sum())

        return {
            "accuracy":          round(acc,  4),
            "precision":         round(prec, 4),
            "recall":            round(rec,  4),
            "f1_score":          round(f1,   4),
            "roc_auc":           round(roc_auc, 4),
            "confusion_matrix":  [[int(tn), int(fp)], [int(fn), int(tp)]],
            "total_anomalies":   n_anomaly,
            "total_normal":      n_total - n_anomaly,
            "anomaly_pct":       round(n_anomaly / n_total * 100, 2),
            "zta_distribution":  {
                "ALLOW":  int(zta_dist.get("ALLOW",  0)),
                "VERIFY": int(zta_dist.get("VERIFY", 0)),
                "DENY":   int(zta_dist.get("DENY",   0)),
            },
        }


# Module-level singleton — shared across API request handlers
detector = AnomalyDetector(contamination=0.15, random_state=42)
