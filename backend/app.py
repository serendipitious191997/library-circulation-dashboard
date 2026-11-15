"""
app.py
Flask REST API Backend for Library Circulation and Demand Dashboard.
Provides endpoints for data ingestion, analytics, validation, search/filtering,
and report generation.
"""

import os
import io
import json
from datetime import datetime, date
from flask import Flask, request, jsonify, send_file, make_response
from flask_cors import CORS
import pandas as pd
from werkzeug.utils import secure_filename

from analysis import LibraryAnalyzer
from validation import check_csv_headers, validate_dataset

# Initialize Flask Application
app = Flask(__name__)
# Enable CORS for all routes and origins
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
EXPORT_FOLDER = os.path.join(BASE_DIR, "exports")
SAMPLE_DATA_FILE = os.path.abspath(os.path.join(BASE_DIR, "..", "sample_data", "library_records.csv"))

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(EXPORT_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB max upload

# Global in-memory analyzer instance
# Initialize with sample data if available
active_analyzer = LibraryAnalyzer()
current_dataset_info = {
    "filename": "None",
    "uploaded_at": None,
    "is_sample": False,
    "total_rows": 0,
}

def load_initial_dataset():
    """Attempts to load the 50-record sample dataset on startup."""
    global active_analyzer, current_dataset_info
    if os.path.exists(SAMPLE_DATA_FILE):
        try:
            df = pd.read_csv(SAMPLE_DATA_FILE)
            active_analyzer = LibraryAnalyzer(df)
            current_dataset_info = {
                "filename": "library_records.csv",
                "uploaded_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "is_sample": True,
                "total_rows": len(df),
            }
            print(f"[INFO] Initialized with sample dataset ({len(df)} records).")
        except Exception as e:
            print(f"[WARN] Could not load sample dataset: {e}")

load_initial_dataset()


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health status and general environment information."""
    return jsonify({
        "status": "healthy",
        "service": "Library Circulation & Demand API",
        "timestamp": datetime.now().isoformat(),
        "dataset_loaded": not active_analyzer.raw_df.empty,
        "dataset_info": current_dataset_info,
    }), 200


@app.route("/api/load-sample", methods=["POST"])
def load_sample_dataset():
    """Convenience endpoint to load or reload the realistic 50-row sample dataset."""
    global active_analyzer, current_dataset_info
    if not os.path.exists(SAMPLE_DATA_FILE):
        return jsonify({"error": "Sample dataset file not found on server."}), 404

    try:
        df = pd.read_csv(SAMPLE_DATA_FILE)
        active_analyzer = LibraryAnalyzer(df)
        current_dataset_info = {
            "filename": "library_records.csv",
            "uploaded_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "is_sample": True,
            "total_rows": len(df),
        }
        return jsonify({
            "message": "Sample dataset loaded successfully.",
            "dataset_info": current_dataset_info,
            "preview": active_analyzer.get_records_dict()[:10],
            "validation": active_analyzer.validation_result,
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to load sample dataset: {str(e)}"}), 500


@app.route("/api/sample-csv", methods=["GET"])
def download_sample_csv():
    """Provides direct download of the official sample CSV file."""
    if not os.path.exists(SAMPLE_DATA_FILE):
        return jsonify({"error": "Sample file not found."}), 404
    return send_file(
        SAMPLE_DATA_FILE,
        mimetype="text/csv",
        as_attachment=True,
        download_name="library_records_sample.csv",
    )


@app.route("/api/upload", methods=["POST"])
def upload_dataset():
    """
    Receives and processes uploaded CSV file.
    Validates headers and data integrity, extracts LoanRecord objects,
    and returns immediate summary and preview.
    """
    global active_analyzer, current_dataset_info

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded. Please select a CSV file."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    if not file.filename.lower().endswith(".csv"):
        return jsonify({"error": "Invalid file format. Please upload a CSV file (.csv)."}), 400

    try:
        # Read into memory using pandas
        # First read raw bytes to validate headers
        content = file.read()
        file.seek(0)
        
        try:
            df = pd.read_csv(io.StringIO(content.decode("utf-8")))
        except UnicodeDecodeError:
            df = pd.read_csv(io.StringIO(content.decode("latin1")))

        if df.empty:
            return jsonify({"error": "The uploaded CSV file is empty."}), 400

        # Validate header structure
        is_valid_header, missing_cols, col_mapping = check_csv_headers(df)
        if not is_valid_header:
            return jsonify({
                "error": "CSV file is missing required columns.",
                "missing_columns": missing_cols,
                "required_columns": [
                    "Loan ID", "Book ID", "Book Title", "Category", 
                    "Student ID", "Borrow Date", "Due Date", "Return Date", "Loan Duration"
                ],
                "uploaded_columns": list(df.columns),
            }), 400

        # Save to disk
        filename = secure_filename(file.filename)
        save_path = os.path.join(app.config["UPLOAD_FOLDER"], f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}")
        df.to_csv(save_path, index=False)

        # Update analyzer
        active_analyzer = LibraryAnalyzer(df)
        current_dataset_info = {
            "filename": filename,
            "uploaded_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "is_sample": False,
            "total_rows": len(df),
        }

        preview_records = active_analyzer.get_records_dict()[:10]
        validation_info = active_analyzer.validation_result

        return jsonify({
            "message": "Dataset uploaded and processed successfully.",
            "dataset_info": current_dataset_info,
            "preview": preview_records,
            "validation": validation_info,
            "summary": active_analyzer.get_dashboard_summary(),
        }), 200

    except Exception as e:
        return jsonify({"error": f"Error parsing CSV file: {str(e)}"}), 500


@app.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    """Returns main statistical cards and preview widgets."""
    summary = active_analyzer.get_dashboard_summary()
    cats = active_analyzer.get_category_analysis()
    trends = active_analyzer.get_monthly_trends()
    
    return jsonify({
        "summary": summary,
        "dataset_info": current_dataset_info,
        "category_preview": cats.get("categories", [])[:5],
        "trend_preview": trends.get("monthly_data", []),
        "recent_records": active_analyzer.get_records_dict()[:5],
    }), 200


@app.route("/api/records", methods=["GET"])
def get_records():
    """
    Returns borrowing records with search, filter, sort, and pagination.
    Query params:
    - search: filter by book title, student ID, or loan ID
    - category: filter by book category
    - sort: 'asc' or 'desc' by borrow_date (default: 'asc')
    - page: page number (1-based, default: 1)
    - limit: records per page (default: 10, max 100)
    """
    search_query = request.args.get("search", "").strip().lower()
    category_filter = request.args.get("category", "").strip()
    status_filter = request.args.get("status", "").strip()
    sort_order = request.args.get("sort", "desc").lower()
    
    try:
        page = max(1, int(request.args.get("page", 1)))
        limit = max(1, min(100, int(request.args.get("limit", 10))))
    except ValueError:
        page = 1
        limit = 10

    records = active_analyzer.get_records_dict()

    # Search filter
    if search_query:
        records = [
            r for r in records
            if search_query in str(r.get("book_title", "")).lower()
            or search_query in str(r.get("student_id", "")).lower()
            or search_query in str(r.get("loan_id", "")).lower()
            or search_query in str(r.get("book_id", "")).lower()
        ]

    # Category filter
    if category_filter and category_filter.lower() != "all":
        records = [
            r for r in records
            if str(r.get("category", "")).lower() == category_filter.lower()
        ]

    # Status filter
    if status_filter and status_filter.lower() != "all":
        records = [
            r for r in records
            if str(r.get("status", "")).lower() == status_filter.lower()
        ]

    # Sort by borrow date
    def sort_key(rec):
        b = rec.get("borrow_date")
        return b if b else "0000-00-00"

    records.sort(key=sort_key, reverse=(sort_order == "desc"))

    total_matched = len(records)
    total_pages = max(1, (total_matched + limit - 1) // limit)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_records = records[start_idx:end_idx]

    # Unique categories for filter dropdown
    all_categories = sorted(list(set(
        r.get("category") for r in active_analyzer.get_records_dict() if r.get("category")
    )))

    return jsonify({
        "records": paginated_records,
        "pagination": {
            "current_page": page,
            "per_page": limit,
            "total_records": total_matched,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        },
        "categories": all_categories,
        "dataset_info": current_dataset_info,
    }), 200


@app.route("/api/category-analysis", methods=["GET"])
def get_category_analysis():
    """Returns detailed category borrowing analysis."""
    data = active_analyzer.get_category_analysis()
    return jsonify({
        **data,
        "dataset_info": current_dataset_info,
    }), 200


@app.route("/api/monthly-trends", methods=["GET"])
def get_monthly_trends():
    """Returns monthly borrowing activity trends, optional year filter."""
    year_param = request.args.get("year")
    year_filter = None
    if year_param and year_param.isdigit():
        year_filter = int(year_param)

    data = active_analyzer.get_monthly_trends(year_filter=year_filter)
    return jsonify({
        **data,
        "dataset_info": current_dataset_info,
    }), 200


@app.route("/api/duration-analysis", methods=["GET"])
def get_duration_analysis():
    """Returns loan duration statistics and grouped distribution."""
    data = active_analyzer.get_duration_analysis()
    return jsonify({
        **data,
        "dataset_info": current_dataset_info,
    }), 200


@app.route("/api/overdue", methods=["GET"])
def get_overdue():
    """Returns overdue book tracking, calculating late returns and active overdues."""
    data = active_analyzer.get_overdue_analysis()
    return jsonify({
        **data,
        "dataset_info": current_dataset_info,
    }), 200


@app.route("/api/validation", methods=["GET"])
def get_validation():
    """Returns dataset validation findings and detailed issue reports."""
    val = active_analyzer.validation_result
    return jsonify({
        "validation": val,
        "dataset_info": current_dataset_info,
    }), 200


@app.route("/api/export/csv", methods=["GET"])
def export_csv():
    """Exports processed records with cleaned loan durations and overdue tags as CSV."""
    df_clean = active_analyzer.generate_cleaned_dataframe()
    output = io.StringIO()
    df_clean.to_csv(output, index=False)
    output.seek(0)

    filename = f"processed_library_circulation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    response = make_response(output.getvalue())
    response.headers["Content-Disposition"] = f"attachment; filename={filename}"
    response.headers["Content-type"] = "text/csv"
    return response


@app.route("/api/export/json", methods=["GET"])
def export_json():
    """
    Exports analysis results in JSON format.
    Query param 'type': 'summary', 'category', 'monthly', 'overdue', 'complete' (default)
    """
    report_type = request.args.get("type", "complete").lower()

    if report_type == "category":
        payload = {
            "report_name": "Category Borrowing Analysis",
            "generated_at": datetime.now().isoformat(),
            "data": active_analyzer.get_category_analysis(),
        }
        filename = "category_analysis_report.json"
    elif report_type == "monthly":
        payload = {
            "report_name": "Monthly Borrowing Trends Report",
            "generated_at": datetime.now().isoformat(),
            "data": active_analyzer.get_monthly_trends(),
        }
        filename = "monthly_trends_report.json"
    elif report_type == "summary":
        payload = {
            "report_name": "Library Circulation Summary Report",
            "generated_at": datetime.now().isoformat(),
            "data": active_analyzer.get_dashboard_summary(),
        }
        filename = "circulation_summary_report.json"
    elif report_type == "overdue":
        payload = {
            "report_name": "Overdue Books Audit Report",
            "generated_at": datetime.now().isoformat(),
            "data": active_analyzer.get_overdue_analysis(),
        }
        filename = "overdue_audit_report.json"
    else:
        # Complete consolidated report
        payload = {
            "report_name": "Complete Library Circulation & Demand Audit Report",
            "generated_at": datetime.now().isoformat(),
            "dataset_info": current_dataset_info,
            "summary": active_analyzer.get_dashboard_summary(),
            "category_analysis": active_analyzer.get_category_analysis(),
            "monthly_trends": active_analyzer.get_monthly_trends(),
            "duration_analysis": active_analyzer.get_duration_analysis(),
            "overdue_analysis": active_analyzer.get_overdue_analysis(),
            "validation_report": active_analyzer.validation_result,
        }
        filename = "complete_library_dashboard_report.json"

    json_str = json.dumps(payload, indent=2)
    response = make_response(json_str)
    response.headers["Content-Disposition"] = f"attachment; filename={filename}"
    response.headers["Content-type"] = "application/json"
    return response


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV") != "production"
    print("=" * 60)
    print("Library Circulation & Demand Dashboard Flask Backend")
    print(f"Server running at: http://127.0.0.1:{port}")
    print("=" * 60)
    app.run(host="0.0.0.0", port=port, debug=debug)
