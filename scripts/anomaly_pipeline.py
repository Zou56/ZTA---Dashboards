"""
============================================================
  ANOMALY DETECTION & ZERO TRUST EVALUATION PIPELINE
  Research: Big Data Analytics + Zero Trust Architecture
  Model   : Isolation Forest
  Author  : Research Pipeline v1.0
============================================================
"""

import warnings
warnings.filterwarnings("ignore")

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")           # non-interactive backend (no display needed)
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import seaborn as sns

from sklearn.preprocessing    import StandardScaler, LabelEncoder
from sklearn.ensemble         import IsolationForest
from sklearn.metrics          import (
    confusion_matrix, accuracy_score,
    precision_score, recall_score, f1_score,
    roc_curve, auc, classification_report
)

# ─── global style ────────────────────────────────────────────────────────────
plt.rcParams.update({
    "figure.facecolor": "#0d1117",
    "axes.facecolor":   "#161b22",
    "axes.edgecolor":   "#30363d",
    "axes.labelcolor":  "#c9d1d9",
    "xtick.color":      "#8b949e",
    "ytick.color":      "#8b949e",
    "text.color":       "#c9d1d9",
    "grid.color":       "#21262d",
    "grid.linestyle":   "--",
    "font.family":      "sans-serif",
    "font.size":        10,
})

PALETTE = {
    "teal":   "#22d3ee",
    "violet": "#a78bfa",
    "rose":   "#f43f5e",
    "amber":  "#fbbf24",
    "green":  "#34d399",
    "blue":   "#60a5fa",
    "grey":   "#8b949e",
}

DIVIDER = "=" * 60

def section(title):
    print(f"\n{DIVIDER}")
    print(f"  {title}")
    print(DIVIDER)

# ╔══════════════════════════════════════════════════════════╗
# ║  1. LOAD DATASET                                         ║
# ╚══════════════════════════════════════════════════════════╝
section("1. LOAD DATASET")

df = pd.read_csv("dataset_fixed.csv", parse_dates=["timestamp"])

print(f"  ✅ File loaded : dataset_fixed.csv")
print(f"  Rows          : {len(df):,}")
print(f"  Columns       : {len(df.columns)}")
print()
print("  Column / dtype overview:")
for col in df.columns:
    print(f"    {col:<30} {str(df[col].dtype):<15} "
          f"  nulls={df[col].isna().sum()}")

print()
print("  Sample rows:")
print(df.head(3).to_string(index=False))

# ╔══════════════════════════════════════════════════════════╗
# ║  2. GROUND TRUTH LABEL                                   ║
# ╚══════════════════════════════════════════════════════════╝
section("2. CREATE GROUND TRUTH LABEL  (is_anomaly)")

FLAG_COLS = [
    "device_change_flag",
    "location_change_flag",
    "midnight_login_flag",
    "high_activity_flag",
    "short_session_flag",
]

# Any flag == 1  →  is_anomaly = 1
df["is_anomaly"] = df[FLAG_COLS].any(axis=1).astype(int)

n_total   = len(df)
n_anomaly = df["is_anomaly"].sum()
n_normal  = n_total - n_anomaly
pct       = n_anomaly / n_total * 100

print(f"  Total rows    : {n_total:,}")
print(f"  Normal  (0)   : {n_normal:,}  ({100 - pct:.1f}%)")
print(f"  Anomaly (1)   : {n_anomaly:,}  ({pct:.1f}%)")
print()
print("  Flag breakdown:")
for col in FLAG_COLS:
    cnt = df[col].sum()
    print(f"    {col:<28} → {cnt:>4} rows  ({cnt/n_total*100:.1f}%)")

# ╔══════════════════════════════════════════════════════════╗
# ║  3. DATA PREPROCESSING                                   ║
# ╚══════════════════════════════════════════════════════════╝
section("3. DATA PREPROCESSING")

# ── 3a. Label encode high-cardinality categoricals ───────────────────────────
df_model = df.copy()
le_device   = LabelEncoder()
le_resource = LabelEncoder()
le_location = LabelEncoder()

df_model["device_type_enc"]    = le_device.fit_transform(df_model["device_type"].astype(str))
df_model["access_resource_enc"]= le_resource.fit_transform(df_model["access_resource"].astype(str))
df_model["location_enc"]       = le_location.fit_transform(df_model["location"].astype(str))

print("  Label encoding applied:")
print(f"    device_type    classes : {list(le_device.classes_)}")
print(f"    access_resource classes: {list(le_resource.classes_)}")

# ── 3b. Feature selection ────────────────────────────────────────────────────
FEATURES = [
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

X = df_model[FEATURES]
y = df_model["is_anomaly"]

print(f"\n  Features selected ({len(FEATURES)}):")
for f in FEATURES:
    print(f"    • {f}")

# ── 3c. Normalize with StandardScaler ────────────────────────────────────────
scaler  = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_scaled_df = pd.DataFrame(X_scaled, columns=FEATURES)

print(f"\n  ✅ StandardScaler applied — shape: {X_scaled_df.shape}")
print("  Feature statistics after scaling:")
stats = X_scaled_df.describe().loc[["mean","std","min","max"]]
print(stats.to_string())

# ╔══════════════════════════════════════════════════════════╗
# ║  4. TRAIN ISOLATION FOREST MODEL                         ║
# ╚══════════════════════════════════════════════════════════╝
section("4. TRAIN ISOLATION FOREST MODEL")

CONTAMINATION = round(pct / 100, 3)   # match real anomaly ratio
print(f"  Contamination parameter : {CONTAMINATION} ({pct:.1f}% of data)")

iso_forest = IsolationForest(
    n_estimators  = 200,
    contamination = CONTAMINATION,
    random_state  = 42,
    n_jobs        = -1,
)
iso_forest.fit(X_scaled)

# Raw scores: negative means anomaly in sklearn convention
raw_scores = iso_forest.decision_function(X_scaled)

# ── Normalize score to [0, 1] where 1 = most anomalous ──────────────────────
# Rescale so larger value = higher anomaly risk (for ZTA logic)
score_min, score_max = raw_scores.min(), raw_scores.max()
anomaly_score = 1 - (raw_scores - score_min) / (score_max - score_min)

df["anomaly_score"]     = np.round(anomaly_score, 4)
# sklearn predict: -1 = anomaly → recode to 1; 1 = normal → 0
raw_pred                = iso_forest.predict(X_scaled)
df["predicted_anomaly"] = np.where(raw_pred == -1, 1, 0)

print(f"\n  ✅ Model trained on {len(X_scaled):,} samples")
print(f"  Predicted anomalies : {df['predicted_anomaly'].sum():,}")
print(f"  Anomaly score range : [{anomaly_score.min():.4f} , {anomaly_score.max():.4f}]")

# ╔══════════════════════════════════════════════════════════╗
# ║  5. EVALUATION                                           ║
# ╚══════════════════════════════════════════════════════════╝
section("5. MODEL EVALUATION")

y_true = df["is_anomaly"]
y_pred = df["predicted_anomaly"]

cm        = confusion_matrix(y_true, y_pred)
accuracy  = accuracy_score(y_true, y_pred)
precision = precision_score(y_true, y_pred, zero_division=0)
recall    = recall_score(y_true, y_pred, zero_division=0)
f1        = f1_score(y_true, y_pred, zero_division=0)

tn, fp, fn, tp = cm.ravel()

print(f"  Confusion Matrix:")
print(f"    TN={tn}  FP={fp}")
print(f"    FN={fn}  TP={tp}")
print()
print(f"  Accuracy  : {accuracy:.4f}  ({accuracy*100:.2f}%)")
print(f"  Precision : {precision:.4f}")
print(f"  Recall    : {recall:.4f}")
print(f"  F1-Score  : {f1:.4f}")
print()
print("  Full classification report:")
print(classification_report(y_true, y_pred,
                             target_names=["Normal", "Anomaly"],
                             zero_division=0))

# ── ROC AUC ─────────────────────────────────────────────────────────────────
fpr, tpr, thresholds = roc_curve(y_true, df["anomaly_score"])
roc_auc = auc(fpr, tpr)
print(f"  ROC AUC Score : {roc_auc:.4f}")

# ╔══════════════════════════════════════════════════════════╗
# ║  6. ZERO TRUST DECISION ENGINE                           ║
# ╚══════════════════════════════════════════════════════════╝
section("6. ZERO TRUST DECISION ENGINE")

def zta_decision(score: float) -> str:
    if score > 0.70:
        return "DENY"
    elif score >= 0.50:
        return "VERIFY"
    else:
        return "ALLOW"

df["zta_decision"] = df["anomaly_score"].apply(zta_decision)

dist = df["zta_decision"].value_counts()
print("  ZTA Decision Distribution:")
for decision, count in dist.items():
    bar = "█" * (count // 10)
    pct_d = count / n_total * 100
    print(f"    {decision:<8} {count:>5}  ({pct_d:5.1f}%)  {bar}")

# ── Decision breakdown by anomaly truth ─────────────────────────────────────
print("\n  ZTA vs. Ground Truth Cross-tab:")
cross = pd.crosstab(df["zta_decision"], df["is_anomaly"],
                    rownames=["ZTA Decision"],
                    colnames=["is_anomaly (0=Normal, 1=Anomaly)"])
print(cross.to_string())

# ╔══════════════════════════════════════════════════════════╗
# ║  7. VISUALIZATION                                        ║
# ╚══════════════════════════════════════════════════════════╝
section("7. GENERATING VISUALIZATIONS")

fig = plt.figure(figsize=(18, 14), facecolor="#0d1117")
fig.suptitle(
    "Anomaly Detection & Zero Trust Architecture — Evaluation Dashboard\n"
    "Model: Isolation Forest  |  Research: Big Data Analytics + ZTA",
    fontsize=13, fontweight="bold", color="#f1f5f9", y=0.98
)

gs = gridspec.GridSpec(2, 3, figure=fig, hspace=0.45, wspace=0.35)

# ── Plot 1: Confusion Matrix heatmap ────────────────────────────────────────
ax1 = fig.add_subplot(gs[0, 0])
cm_norm = cm.astype(float) / cm.sum(axis=1)[:, np.newaxis]
sns.heatmap(
    cm, annot=True, fmt="d", ax=ax1,
    cmap=sns.color_palette("mako", as_cmap=True),
    linewidths=1, linecolor="#0d1117",
    annot_kws={"size": 14, "weight": "bold", "color": "white"},
    xticklabels=["Normal", "Anomaly"],
    yticklabels=["Normal", "Anomaly"],
    cbar_kws={"shrink": 0.7},
)
ax1.set_title("Confusion Matrix", color=PALETTE["teal"], fontweight="bold", pad=10)
ax1.set_xlabel("Predicted",  color="#94a3b8")
ax1.set_ylabel("Actual",     color="#94a3b8")
ax1.tick_params(colors="#94a3b8")

# Annotate cells with labels
for (i, j), val in np.ndenumerate(cm):
    label = ["TN", "FP", "FN", "TP"][i * 2 + j]
    ax1.text(j + 0.5, i + 0.75, label,
             ha="center", va="center", fontsize=9,
             color="#94a3b8", style="italic")

# ── Plot 2: ROC Curve ────────────────────────────────────────────────────────
ax2 = fig.add_subplot(gs[0, 1])
ax2.plot(fpr, tpr, color=PALETTE["violet"], lw=2.5,
         label=f"ROC Curve (AUC = {roc_auc:.3f})")
ax2.fill_between(fpr, tpr, alpha=0.12, color=PALETTE["violet"])
ax2.plot([0, 1], [0, 1], color=PALETTE["grey"], lw=1, linestyle="--",
         label="Random Baseline")
ax2.set_xlim([0, 1])
ax2.set_ylim([0, 1.02])
ax2.set_title("ROC Curve", color=PALETTE["violet"], fontweight="bold", pad=10)
ax2.set_xlabel("False Positive Rate")
ax2.set_ylabel("True Positive Rate")
ax2.legend(fontsize=9, framealpha=0.2, edgecolor="#30363d")
ax2.grid(True, alpha=0.3)

# best threshold marker
best_idx = np.argmax(tpr - fpr)
ax2.scatter(fpr[best_idx], tpr[best_idx], s=80, color=PALETTE["amber"],
            zorder=5, label=f"Best Threshold ≈ {thresholds[best_idx]:.2f}")
ax2.annotate(f"  Thresh={thresholds[best_idx]:.2f}",
             (fpr[best_idx], tpr[best_idx]),
             color=PALETTE["amber"], fontsize=8)

# ── Plot 3: Anomaly Score Distribution ───────────────────────────────────────
ax3 = fig.add_subplot(gs[0, 2])
normal_scores  = df[df["is_anomaly"] == 0]["anomaly_score"]
anomaly_scores = df[df["is_anomaly"] == 1]["anomaly_score"]

ax3.hist(normal_scores,  bins=40, alpha=0.7, color=PALETTE["green"],
         label="Normal", edgecolor="none")
ax3.hist(anomaly_scores, bins=40, alpha=0.7, color=PALETTE["rose"],
         label="Anomaly", edgecolor="none")
ax3.axvline(0.50, color=PALETTE["amber"], linestyle="--", lw=1.5, label="VERIFY threshold (0.5)")
ax3.axvline(0.70, color=PALETTE["rose"],  linestyle="--", lw=1.5, label="DENY threshold (0.7)")
ax3.set_title("Anomaly Score Distribution", color=PALETTE["teal"],
              fontweight="bold", pad=10)
ax3.set_xlabel("Anomaly Score (0=normal, 1=anomalous)")
ax3.set_ylabel("Count")
ax3.legend(fontsize=8, framealpha=0.2, edgecolor="#30363d")
ax3.grid(True, alpha=0.3)

# ── Plot 4: ZTA Decision Bar Chart ───────────────────────────────────────────
ax4 = fig.add_subplot(gs[1, 0])
zta_order  = ["ALLOW", "VERIFY", "DENY"]
zta_counts = [dist.get(d, 0) for d in zta_order]
zta_colors = [PALETTE["green"], PALETTE["amber"], PALETTE["rose"]]

bars = ax4.bar(zta_order, zta_counts, color=zta_colors,
               width=0.5, edgecolor="#0d1117", linewidth=1.5)
for bar, count in zip(bars, zta_counts):
    ax4.text(bar.get_x() + bar.get_width() / 2,
             bar.get_height() + 8,
             f"{count}\n({count/n_total*100:.1f}%)",
             ha="center", va="bottom", fontsize=10, fontweight="bold",
             color="#f1f5f9")

ax4.set_title("Zero Trust Decision Distribution",
              color=PALETTE["rose"], fontweight="bold", pad=10)
ax4.set_ylabel("Number of Sessions")
ax4.set_ylim(0, max(zta_counts) * 1.18)
ax4.grid(True, alpha=0.3, axis="y")

# ── Plot 5: Metrics Summary Bar ───────────────────────────────────────────────
ax5 = fig.add_subplot(gs[1, 1])
metrics  = ["Accuracy", "Precision", "Recall", "F1-Score", "AUC"]
values   = [accuracy, precision, recall, f1, roc_auc]
m_colors = [PALETTE["teal"], PALETTE["violet"], PALETTE["amber"],
            PALETTE["blue"], PALETTE["green"]]

bars2 = ax5.barh(metrics, values, color=m_colors,
                 height=0.55, edgecolor="#0d1117", linewidth=1)
for bar, val in zip(bars2, values):
    ax5.text(val + 0.01, bar.get_y() + bar.get_height() / 2,
             f"{val:.3f}", va="center", fontsize=10, fontweight="bold",
             color="#f1f5f9")

ax5.set_xlim(0, 1.12)
ax5.set_title("Model Performance Metrics",
              color=PALETTE["blue"], fontweight="bold", pad=10)
ax5.set_xlabel("Score")
ax5.grid(True, alpha=0.3, axis="x")
ax5.axvline(1.0, color=PALETTE["grey"], linestyle="--", lw=1, alpha=0.5)

# ── Plot 6: Anomaly Type Contribution ────────────────────────────────────────
ax6 = fig.add_subplot(gs[1, 2])
flag_labels = {
    "device_change_flag":   "Device Change",
    "location_change_flag": "Impossible Travel",
    "midnight_login_flag":  "Midnight Login",
    "high_activity_flag":   "High Activity Spike",
    "short_session_flag":   "Short Session Burst",
}
flag_counts = [df[col].sum() for col in FLAG_COLS]
flag_names  = [flag_labels[col] for col in FLAG_COLS]
f_colors    = [PALETTE["violet"], PALETTE["teal"], PALETTE["amber"],
               PALETTE["rose"],   PALETTE["green"]]

wedges, texts, autotexts = ax6.pie(
    flag_counts, labels=flag_names, colors=f_colors,
    autopct="%1.1f%%", startangle=140,
    pctdistance=0.75,
    wedgeprops=dict(edgecolor="#0d1117", linewidth=2),
    textprops=dict(fontsize=8),
)
for at in autotexts:
    at.set_fontsize(8)
    at.set_fontweight("bold")
    at.set_color("white")

ax6.set_title("Anomaly Type Contribution",
              color=PALETTE["amber"], fontweight="bold", pad=10)

plt.savefig("anomaly_evaluation_dashboard.png",
            dpi=150, bbox_inches="tight",
            facecolor="#0d1117")
print("  ✅ Dashboard saved  → anomaly_evaluation_dashboard.png")

# ╔══════════════════════════════════════════════════════════╗
# ║  8. SAVE OUTPUT DATASET                                  ║
# ╚══════════════════════════════════════════════════════════╝
section("8. SAVE OUTPUT DATASET")

OUTPUT_COLS = list(df.columns)   # keep every original column + new ones
df.to_csv("dataset_with_predictions.csv", index=False)

print(f"  ✅ Saved : dataset_with_predictions.csv")
print(f"  Columns  : {len(df.columns)}")
print(f"  Rows     : {len(df):,}")
print("\n  New columns added:")
for col in ["is_anomaly", "anomaly_score", "predicted_anomaly", "zta_decision"]:
    sample = df[col].value_counts().to_dict()
    print(f"    • {col:<25} → {sample}")

# ╔══════════════════════════════════════════════════════════╗
# ║  9. RESEARCH INSIGHTS                                    ║
# ╚══════════════════════════════════════════════════════════╝
section("9. RESEARCH INSIGHTS & INTERPRETATION")

# Most frequent anomaly type
flag_series  = pd.Series(flag_counts, index=[flag_labels[c] for c in FLAG_COLS])
top_anomaly  = flag_series.idxmax()
top_count    = flag_series.max()

detected_by_model = df[(df["predicted_anomaly"] == 1) & (df["is_anomaly"] == 1)]
true_anomalies    = df[df["is_anomaly"] == 1]
detection_rate    = len(detected_by_model) / len(true_anomalies) * 100 if len(true_anomalies) > 0 else 0

deny_count   = dist.get("DENY",   0)
verify_count = dist.get("VERIFY", 0)
allow_count  = dist.get("ALLOW",  0)

deny_anomaly = len(df[(df["zta_decision"] == "DENY")  & (df["is_anomaly"] == 1)])
deny_total   = deny_count
zta_prec     = deny_anomaly / deny_total * 100 if deny_total > 0 else 0

print(f"""
  ┌─────────────────────────────────────────────────────┐
  │  ANOMALY DETECTION INSIGHTS                         │
  ├─────────────────────────────────────────────────────┤
  │  Dataset size          : {n_total:>6,} rows                │
  │  Ground truth anomalies: {n_anomaly:>6,} ({pct:.1f}%)              │
  │  Detected by model     : {len(detected_by_model):>6,} ({detection_rate:.1f}% of true +)  │
  │  Most frequent anomaly : {top_anomaly:<30}│
  │  Top anomaly count     : {top_count:>6,} rows                │
  ├─────────────────────────────────────────────────────┤
  │  MODEL PERFORMANCE SUMMARY                          │
  ├─────────────────────────────────────────────────────┤
  │  Accuracy              : {accuracy:.4f}                    │
  │  Precision             : {precision:.4f}                    │
  │  Recall                : {recall:.4f}                    │
  │  F1-Score              : {f1:.4f}                    │
  │  ROC AUC               : {roc_auc:.4f}                    │
  ├─────────────────────────────────────────────────────┤
  │  ZERO TRUST EFFECTIVENESS                           │
  ├─────────────────────────────────────────────────────┤
  │  ALLOW decisions       : {allow_count:>6,} ({allow_count/n_total*100:.1f}%)             │
  │  VERIFY decisions      : {verify_count:>6,} ({verify_count/n_total*100:.1f}%)             │
  │  DENY decisions        : {deny_count:>6,} ({deny_count/n_total*100:.1f}%)             │
  │  DENY precision        : {zta_prec:.1f}% of DENY were true anomalies │
  └─────────────────────────────────────────────────────┘

  KEY FINDINGS:
  ─────────────
  1. Isolation Forest identified {df['predicted_anomaly'].sum()} suspicious sessions
     using {len(FEATURES)} behavioral features.
  2. The '{top_anomaly}' pattern is the most
     common anomaly in this dataset ({top_count} cases).
  3. ZTA blocked {deny_count} sessions (DENY) — of which {zta_prec:.1f}%
     were confirmed true anomalies → high precision enforcement.
  4. {verify_count} sessions triggered step-up authentication (VERIFY),
     providing an adaptive security layer for medium-risk events.
  5. ROC AUC of {roc_auc:.3f} indicates the model effectively separates
     normal from anomalous user behavior in unsupervised setting.
""")

print(DIVIDER)
print("  PIPELINE COMPLETE ✅")
print(f"  Output files:")
print(f"    • dataset_with_predictions.csv")
print(f"    • anomaly_evaluation_dashboard.png")
print(DIVIDER)
