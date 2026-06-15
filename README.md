# 🎓 AttendIQ – College Attendance Predictor

A full-stack ML-powered web app that helps students predict future attendance and determine exam eligibility.

**Tech Stack:** React + Vite · Flask · scikit-learn · Chart.js · Tailwind CSS · Framer Motion

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔮 ML Prediction | Random Forest model (98.6% accuracy) predicts future attendance |
| 📊 Analytics Dashboard | Line, bar, and donut charts via Chart.js |
| 🎮 Simulator | Slide to see impact of attending/missing N classes |
| 💡 Smart Recommendations | Auto-generated actionable guidance |
| 📄 PDF Export | Full report via jsPDF |
| 📊 CSV Export | Analytics data download |
| 🏅 Eligibility Checker | Color-coded: Eligible / Warning / Not Eligible |
| 📱 Responsive | Mobile and desktop layouts |

---

## 🗂 Project Structure

```
attendance-predictor/
├── frontend/              # React + Vite app
│   ├── src/
│   │   ├── App.jsx        # Main component with all UI
│   │   ├── utils/
│   │   │   ├── api.js     # Flask API calls
│   │   │   └── pdf.js     # PDF export
│   │   └── index.css      # Tailwind + custom styles
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── app.py             # Flask REST API
│   └── requirements.txt
│
├── model/
│   ├── train_model.py     # ML training script
│   ├── attendance_model.pkl  # Trained model (auto-generated)
│   └── model_metrics.json
│
├── dataset/
│   ├── generate_dataset.py
│   ├── attendance_data.json
│   └── attendance_data.csv
│
└── README.md
```

---

## 🚀 Installation & Running

### Prerequisites
- Node.js 18+
- Python 3.9+

### 1. Clone and setup

```bash
git clone <your-repo>
cd attendance-predictor
```

### 2. Generate dataset & train model

```bash
cd dataset
python3 generate_dataset.py

cd ../model
pip install scikit-learn numpy
python3 train_model.py
```

### 3. Start Flask backend

```bash
cd backend
pip install -r requirements.txt
python3 app.py
# → Running on http://localhost:5000
```

### 4. Start React frontend

```bash
cd frontend
npm install
npm run dev
# → Running on http://localhost:3000
```

---

## 🌐 Deployment

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add env variable: `VITE_API_URL=https://your-backend.onrender.com`

### Backend → Render

1. Push `backend/` + `model/` + `dataset/` to GitHub
2. Create new **Web Service** at [render.com](https://render.com)
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `gunicorn app:app`
5. Note: run `generate_dataset.py` and `train_model.py` as part of build

```bash
# Render build command:
pip install -r requirements.txt && cd ../dataset && python3 generate_dataset.py && cd ../model && python3 train_model.py
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/predict` | Main prediction |
| GET | `/api/model-info` | Model metrics |
| POST | `/api/export/csv` | CSV download |

### POST `/api/predict` — Request Body

```json
{
  "name": "Alex Johnson",
  "total_classes": 80,
  "attended_classes": 62,
  "future_classes": 20,
  "min_requirement": 75
}
```

---

## 🤖 ML Model

- **Algorithm:** Random Forest Regressor (primary), Linear Regression (secondary)
- **Features:** current attendance %, total/attended/future classes, requirement, missed count, ratio
- **Training data:** 1,000 synthetic samples with 5 behavior patterns (good/average/poor/improving/declining)
- **Evaluation:** 5-fold cross-validation, R²=0.986, MAE≈1.4%
- **Output:** Predicted attendance % after upcoming classes

---

## 📸 Resume Highlights

> **"Built AttendIQ, an end-to-end ML web application using React, Flask, and scikit-learn. Trained a Random Forest regression model (R²=0.986) on synthetic attendance data, served via REST API, and deployed with Vercel + Render. Features include real-time predictions, analytics dashboards, simulation tools, and PDF/CSV exports."**

---

MIT License · Made with ❤️ for students
