# 🛡️ ZTA Anomaly Detection System
### Big Data Analytics based on Zero Trust Architecture for Anomaly Detection in Information Systems

This repository contains a full-stack implementation of a cybersecurity monitoring platform. It combines **Unsupervised Machine Learning** (Isolation Forest) with **Zero Trust Architecture (ZTA)** principles to detect and mitigate anomalies in user behavioral patterns.

---

## 🚀 Features

- **Advanced Data Simulation**: Real-world user behavior baselines with injected cybersecurity anomalies (Impossible Travel, Midnight Logins, Privilege Escalation, etc.).
- **Anomaly Detection Pipeline**: An end-to-end ML pipeline using `scikit-learn`'s Isolation Forest to compute risk scores.
- **Zero Trust Decision Engine**: Simulated Policy Decision Point (PDP) that categorizes sessions into `ALLOW`, `VERIFY`, or `DENY` based on real-time risk scores.
- **Interactive Dashboard**: Full-stack web application built with **FastAPI** and **React** for seamless data visualization and management.
- **Academic Standard Metrics**: Comprehensive evaluation including Confusion Matrix, ROC-AUC, F1-Score, and Precision/Recall.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Python, FastAPI, Scikit-learn, Pandas, SQLite |
| **Frontend** | React.js, Vite, TailwindCSS, Recharts, Lucide Icons |
| **Big Data (Conceptual)** | Apache Kafka, Apache Spark, Hadoop HDFS |
| **Security** | Zero Trust Architecture (PDP/PEP), JWT/Token Auth |

---

## 📂 Project Structure

```text
Metode Penelitian/
├── datasets/            # User activity logs & datasets
│   ├── raw/             # Initial generated logs
│   ├── processed/       # Cleaned & high-quality datasets (Advanced ZTA)
│   └── results/         # Final analysis & predictions
├── docs/                # Project documentation
│   ├── diagrams/        # Architecture & Flow diagrams
│   └── results/         # Visual evaluation dashboard (PNG)
├── scripts/             # Sequential processing scripts (01-04)
└── zta-dashboard/       # The Full-Stack Web Application
    ├── backend/         # FastAPI, Model logic, and Utilities
    └── frontend/        # React (Vite) Source Code & Components
```

---

## 🚦 Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js & npm
- Virtual Environment (recommended)

### 2. Running the Backend
```bash
cd zta-dashboard/backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Running the Frontend
```bash
cd zta-dashboard/frontend
npm install
npm run dev
```

### 4. Admin Access
- **URL**: `http://localhost:5173`
- **Username**: `admin`
- **Password**: `admin123`

---

## 📊 Visualizations

The system provides several analytical charts:
1. **ZTA Decision Distribution**: Overview of access control enforcement.
2. **Anomaly vs Normal**: Class distribution within the current dataset.
3. **Anomaly Score Timeline**: Time-series progression of user risk scores.
4. **Radar Metrics**: Comparison of model performance (Accuracy, F1, etc.).

---

## 📑 Research Context
This project is part of a research initiative titled **"Implementation of Big Data Analytics based on Zero Trust Architecture for Anomaly Detection in Information Systems"**. It focuses on moving beyond static perimeter security towards dynamic, risk-based access control.

---

## 📄 License
This project is for research and educational purposes. Distributed under the MIT License.

---
**Created by:** `[Your Name/Metode Penelitian]`
