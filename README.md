# Library Circulation and Demand Dashboard 📚📊

WEBSITE : https://library-circulation-dashboard-ffa7.vercel.app

REPORT : https://drive.google.com/file/d/1nhHO5jcLOUMGEWWogxY3u9Zte9w2S2MQ/view?usp=sharing

> **College Python Programming Laboratory Project**  
> A full-stack, responsive web application for library circulation management, demand forecasting, loan duration auditing, and overdue book tracking.

![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)
![Flask](https://img.shields.io/badge/Backend-Flask%20REST%20API-green.svg)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb.svg)
![Pandas](https://img.shields.io/badge/Data%20Analysis-Pandas-150458.svg)
![Recharts](https://img.shields.io/badge/Charts-Recharts-22c55e.svg)

---

## 📖 Project Overview

The **Library Circulation and Demand Dashboard** replaces static manual logs and spreadsheets with an automated, data-driven analytical dashboard. Designed for college library administrators and engineering laboratory demonstrations, it processes borrowing transaction logs to evaluate student demand across academic disciplines, trace monthly circulation peaks, compute book loan durations, and identify overdue loans before fines accumulate.

### 🌟 Key Highlights
- **Bright & Light Pastel Aesthetic**: Clean white/cream background (`#fbfbf9`), soft pastel cards (sky blue, lavender, mint, peach, yellow), charcoal navy typography for crisp readability, and subtle shadows.
- **Object-Oriented Backend**: Implements a modular `LoanRecord` class in Python providing encapsulation for date conversions, duration calculations, and overdue status determination.
- **Zero Silent Deletion Data Validation**: Verifies header integrity, identifies duplicates, missing values, and chronological date flaws while retaining and reporting all flagged rows with diagnostic explanations.
- **Interactive Visualizations**: Powered by Recharts for category bar charts, percentage donut charts, monthly trajectory area charts, and duration distribution histograms.
- **Multi-Format Export Engine**: Exports cleaned datasets as CSV (with computed durations and overdue tags) alongside Category, Monthly, and Complete Audit reports as formatted JSON.

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React.js (v18) + Vite (v6) | Fast, responsive Single Page Application (SPA) |
| **Interactive Charts** | Recharts (v2) | Responsive bar charts, line graphs, donut charts |
| **Icons & UI** | Lucide React | Minimal, modern vector icons |
| **API Client** | Axios | REST API communication with Flask backend |
| **Backend Framework** | Python 3 + Flask (v3) | Lightweight RESTful microservices |
| **Cross-Origin Security** | Flask-CORS | Secure communication between frontend and backend |
| **Data Processing** | Pandas + NumPy | High-performance CSV parsing, filtering, aggregation |
| **Plotting & Analytics** | Matplotlib | Numerical calculations and statistical summaries |
| **Data Interchange** | Python `csv`, `json`, `datetime` | Standard serialization and chronological date handling |

---

## 📁 Project Directory Structure

```text
library-circulation-dashboard/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx          # Collapsible responsive navigation sidebar
│   │   │   ├── Header.jsx           # Top banner with date, record count, and sample loader
│   │   │   ├── StatCard.jsx         # Pastel KPI cards with icons and status badges
│   │   │   └── ChartCard.jsx        # Reusable container for Recharts components
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Summary KPI metrics and quick chart previews
│   │   │   ├── UploadDataset.jsx    # Drag-and-drop CSV uploader & live preview
│   │   │   ├── BorrowingRecords.jsx # Searchable, filterable, paginated transaction table
│   │   │   ├── CategoryAnalysis.jsx # Category frequency bar & donut percentage distribution
│   │   │   ├── MonthlyTrends.jsx    # Monthly borrowing line chart with year filter
│   │   │   ├── LoanDuration.jsx     # Duration histograms (1-5d, 6-10d, 11-15d, etc.)
│   │   │   ├── OverdueBooks.jsx     # Unreturned vs. returned-late overdue audit table
│   │   │   ├── DataValidation.jsx   # 6-card data quality audit & flagged row diagnostics
│   │   │   ├── ExportReports.jsx    # CSV and JSON report downloads with live preview
│   │   │   └── AboutProject.jsx     # System architecture, objectives, and tech specs
│   │   │
│   │   ├── services/
│   │   │   └── api.js               # Centralized Axios client calling Flask REST endpoints
│   │   │
│   │   ├── App.jsx                  # Main application state and page switcher
│   │   ├── main.jsx                 # React root renderer
│   │   └── style.css                # Custom pastel styling and responsive CSS
│   │
│   ├── .env.example                 # Frontend environment variables template
│   ├── index.html                   # HTML entry point with Plus Jakarta Sans font
│   ├── package.json                 # Node dependencies and build scripts
│   └── vite.config.js               # Vite build configuration and API reverse proxy
│
├── backend/
│   ├── app.py                       # Flask REST API endpoints and server routes
│   ├── analysis.py                  # LibraryAnalyzer processing engine
│   ├── loan_record.py               # LoanRecord Object-Oriented class
│   ├── validation.py                # Header, duplicate, missing value, and date checks
│   ├── requirements.txt             # Python backend dependencies
│   ├── uploads/                     # Storage folder for user-uploaded CSV files
│   └── exports/                     # Storage directory for generated audit reports
│
├── sample_data/
│   └── library_records.csv          # Realistic 50-row benchmark dataset
│
├── .gitignore                       # Excludes node_modules, .venv, build artifacts
├── README.md                        # Complete documentation and setup manual
└── requirements.txt                 # Root Python requirements file
```

---

## 📊 Pre-Configured Sample Dataset

The project includes an official 50-record sample dataset located at `sample_data/library_records.csv` calibrated exactly to college lab requirements:

- **Category Breakdown (50 Total Loans)**:
  - Computer Science: **16 loans** (32%)
  - Mathematics: **12 loans** (24%)
  - Electronics: **9 loans** (18%)
  - Literature: **7 loans** (14%)
  - Physics: **6 loans** (12%)
- **Monthly Trajectory**:
  - January: **10 loans**
  - February: **12 loans**
  - March: **14 loans**
  - April: **14 loans**
- **Overdue Scenarios Included**:
  - Books returned on time (`return_date <= due_date`)
  - Books returned late (`return_date > due_date`)
  - Books currently overdue and still checked out (`return_date` is blank and `due_date < current_date`)

---

## 🚀 Quick Start Guide (Local Setup)

### Prerequisites
- **Python 3.9+** ([Download Python](https://www.python.org/downloads/))
- **Node.js 18+ & npm** ([Download Node.js](https://nodejs.org/))

---

### Step 1: Clone or Navigate to the Project

```bash
cd "c:\Users\lenovo\Desktop\LIBRARY CIRCULATION AND DEMAND DASHBOARD"
```

---

### Step 2: Start the Python Flask Backend

Open a terminal window:

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create a virtual environment
python -m venv .venv

# 3. Activate the virtual environment
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Windows (Command Prompt):
.\.venv\Scripts\activate.bat
# macOS / Linux:
source .venv/bin/activate

# 4. Install backend dependencies
pip install -r requirements.txt

# 5. Start the Flask server
python app.py
```

The Flask backend will launch at:  
👉 **`http://127.0.0.1:5000`**

*(Note: The server automatically initializes with the 50-row sample dataset so dashboard charts are populated immediately).*

---

### Step 3: Start the React Frontend

Open a **second** terminal window:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

The React frontend will launch at:  
👉 **`http://localhost:5173`**

Open your web browser and navigate to `http://localhost:5173` to explore the dashboard.

---

## 📡 REST API Reference

The Flask backend exposes clean REST API endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and current dataset info |
| `POST` | `/api/load-sample` | Instantly reloads the 50-row realistic sample CSV |
| `GET` | `/api/sample-csv` | Direct download of `library_records.csv` |
| `POST` | `/api/upload` | Multipart form upload for custom CSV datasets |
| `GET` | `/api/dashboard` | Main KPI statistics and preview chart summaries |
| `GET` | `/api/records` | Paginated records with `search`, `category`, `status`, and `sort` |
| `GET` | `/api/category-analysis` | Subject volume counts, proportions, and top/bottom categories |
| `GET` | `/api/monthly-trends` | Monthly circulation trajectory with optional `?year=2026` filter |
| `GET` | `/api/duration-analysis` | Duration metrics and grouped buckets (`1-5d`, `6-10d`, etc.) |
| `GET` | `/api/overdue` | Unreturned active overdues and late return audit list |
| `GET` | `/api/validation` | Dataset integrity audit, duplicate count, and issue diagnostics |
| `GET` | `/api/export/csv` | Download cleaned dataset as CSV with calculated durations |
| `GET` | `/api/export/json` | Download JSON reports (`?type=complete`, `category`, `monthly`) |

---

## 📑 CSV Dataset Specification

When uploading custom CSV datasets in the **Upload Dataset** section, ensure the following columns are present:

| Column Header | Status | Description | Example |
|---|---|---|---|
| `Loan ID` | **Required** | Unique transaction identifier | `L001` |
| `Book ID` | **Required** | Library catalog accession number | `CS101` |
| `Book Title` | **Required** | Complete title of the book | `Introduction to Algorithms` |
| `Category` | **Required** | Subject or academic department | `Computer Science` |
| `Student ID` | **Required** | University student enrollment ID | `STU1001` |
| `Borrow Date` | **Required** | Date book was checked out (`YYYY-MM-DD`) | `2026-01-05` |
| `Due Date` | **Required** | Scheduled return deadline (`YYYY-MM-DD`) | `2026-01-19` |
| `Return Date` | *Optional* | Date returned (`YYYY-MM-DD`). Leave blank if active. | `2026-01-18` |
| `Loan Duration` | *Optional* | Integer days. If blank, backend calculates automatically. | `13` |

> 💡 **Smart Duration Fallback**: If `Loan Duration` is omitted or empty, the backend computes:
> - Returned books: `Return Date - Borrow Date`
> - Active loans: `Current Date - Borrow Date`

---

## 🐙 Pushing the Project to GitHub

Follow these steps to push the project to your GitHub repository:

```bash
# 1. Initialize git in the root folder
git init

# 2. Add all files to staging (.gitignore automatically excludes node_modules and .venv)
git add .

# 3. Create your first commit
git commit -m "Initial commit: Complete Library Circulation and Demand Dashboard"

# 4. Rename default branch to main
git branch -M main

# 5. Link to your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/library-circulation-dashboard.git

# 6. Push to GitHub
git push -u origin main
```

---

## 🌐 Deployment Instructions

### 1. Deploy Backend (e.g. Render / Railway)

1. Connect your GitHub repository to **Render** (or Railway).
2. Choose **Web Service**.
3. Set the following configuration:
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app:app`
4. Once deployed, copy your backend URL (e.g. `https://library-backend.onrender.com`).

### 2. Deploy Frontend (e.g. Vercel / Netlify)

1. Connect your repository to **Vercel** (or Netlify).
2. Set configuration:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend-app.onrender.com/api`
4. Deploy! Your full-stack dashboard is live worldwide.

---

## 🧪 Testing and Verification

Before delivery, the following tests were conducted and verified:
1. ✅ **Backend OOP Model**: `LoanRecord` instantiates and calculates durations and overdue days accurately.
2. ✅ **Validation Logic**: Successfully flags missing fields, chronological date errors, and duplicate IDs without silent dropping.
3. ✅ **Sample Dataset**: 50 records loaded with exact verified counts (CS: 16, Math: 12, Electronics: 9, Lit: 7, Physics: 6).
4. ✅ **Frontend Production Bundle**: Built with `npm run build` with 0 syntax or bundling errors.
5. ✅ **Interactive Recharts**: Bar charts, line graphs, donut charts, and histograms verified responsive across screen widths.
6. ✅ **Export Endpoints**: Processed CSV and JSON downloads confirmed working with real server outputs.

---

## 📄 License & Academic Credit

Developed as an academic engineering project for the **Python Programming Laboratory**.  
Free to use and adapt for academic, non-commercial, and educational demonstration purposes.
