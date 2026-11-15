"""
validation.py
Data validation module for the Library Circulation Dataset.
Detects missing columns, duplicates, missing values, invalid dates, and incomplete records.
Provides comprehensive explanations without silently deleting records.
"""

from datetime import datetime, date
from typing import Dict, Any, List, Tuple
import pandas as pd


REQUIRED_COLUMNS = [
    "Loan ID",
    "Book ID",
    "Book Title",
    "Category",
    "Student ID",
    "Borrow Date",
    "Due Date",
    "Return Date",
    "Loan Duration",
]

# Core mandatory fields for a borrowing transaction to be structurally valid
MANDATORY_FIELDS = ["Loan ID", "Book ID", "Book Title", "Category", "Student ID", "Borrow Date", "Due Date"]


def normalize_column_name(col: str) -> str:
    """Normalizes column names for flexible, case-insensitive matching."""
    return "".join(e for e in col.lower() if e.isalnum())


def check_csv_headers(df: pd.DataFrame) -> Tuple[bool, List[str], Dict[str, str]]:
    """
    Checks if the uploaded DataFrame has the expected columns.
    Returns (is_valid, missing_columns, column_mapping).
    """
    existing_cols = {normalize_column_name(c): c for c in df.columns}
    missing = []
    mapping = {}

    for req in REQUIRED_COLUMNS:
        norm = normalize_column_name(req)
        if norm in existing_cols:
            mapping[req] = existing_cols[norm]
        else:
            # Check if it's Loan Duration or Return Date (which can be derived/optional)
            if req not in ["Return Date", "Loan Duration"]:
                missing.append(req)
            else:
                mapping[req] = None

    is_valid = len(missing) == 0
    return is_valid, missing, mapping


def try_parse_date(val: Any) -> Tuple[bool, Any]:
    """Attempts to parse a date string. Returns (is_valid, parsed_date_or_None)."""
    if val is None or pd.isna(val):
        return True, None  # Empty date is allowed for Return Date
    s = str(val).strip()
    if not s or s.lower() in ("nan", "none", "null", "nat"):
        return True, None

    formats = [
        "%Y-%m-%d",
        "%d-%m-%Y",
        "%m/%d/%Y",
        "%d/%m/%Y",
        "%Y/%m/%d",
        "%Y-%m-%d %H:%M:%S",
    ]
    for fmt in formats:
        try:
            return True, datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    try:
        return True, datetime.fromisoformat(s.split("T")[0]).date()
    except Exception:
        return False, None


def validate_dataset(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Performs thorough validation across all rows in the dataset:
    - Duplicate Loan IDs
    - Missing mandatory values
    - Invalid date formats
    - Inconsistent chronological dates (Borrow Date > Due Date or Borrow Date > Return Date)
    - Incomplete records
    
    Returns structured summary and detailed per-record issue descriptions.
    """
    total_records = len(df)
    issues_list: List[Dict[str, Any]] = []
    
    # Track metrics
    duplicate_count = 0
    missing_value_records_count = 0
    invalid_date_records_count = 0
    incomplete_records_count = 0
    
    # Find duplicate Loan IDs
    loan_id_col = None
    for c in df.columns:
        if normalize_column_name(c) == "loanid":
            loan_id_col = c
            break

    seen_ids = set()
    duplicate_ids = set()
    if loan_id_col:
        for val in df[loan_id_col]:
            s_val = str(val).strip() if pd.notna(val) else ""
            if s_val:
                if s_val in seen_ids:
                    duplicate_ids.add(s_val)
                else:
                    seen_ids.add(s_val)

    # Column name mappings
    col_map = {normalize_column_name(c): c for c in df.columns}
    
    invalid_row_indices = set()

    for idx, row in df.iterrows():
        row_issues: List[str] = []
        row_num = int(idx) + 1  # 1-based index for user friendliness
        
        # 1. Duplicate check
        loan_id = str(row.get(loan_id_col, "")).strip() if loan_id_col and pd.notna(row.get(loan_id_col)) else f"Row #{row_num}"
        if loan_id_col and loan_id in duplicate_ids:
            row_issues.append(f"Duplicate Loan ID '{loan_id}' found in dataset.")

        # 2. Missing mandatory fields
        missing_fields = []
        for req in MANDATORY_FIELDS:
            norm = normalize_column_name(req)
            col = col_map.get(norm)
            if not col or pd.isna(row.get(col)) or str(row.get(col)).strip() == "":
                missing_fields.append(req)

        if missing_fields:
            row_issues.append(f"Missing mandatory value(s): {', '.join(missing_fields)}.")
            missing_value_records_count += 1
            incomplete_records_count += 1

        # 3. Date parsing & logical validation
        borrow_col = col_map.get("borrowdate")
        due_col = col_map.get("duedate")
        return_col = col_map.get("returndate")

        b_ok, b_date = try_parse_date(row.get(borrow_col)) if borrow_col else (False, None)
        d_ok, d_date = try_parse_date(row.get(due_col)) if due_col else (False, None)
        r_ok, r_date = try_parse_date(row.get(return_col)) if return_col else (True, None)

        date_has_error = False
        if not b_ok and borrow_col and pd.notna(row.get(borrow_col)):
            row_issues.append(f"Invalid Borrow Date format: '{row.get(borrow_col)}'.")
            date_has_error = True
        if not d_ok and due_col and pd.notna(row.get(due_col)):
            row_issues.append(f"Invalid Due Date format: '{row.get(due_col)}'.")
            date_has_error = True
        if not r_ok and return_col and pd.notna(row.get(return_col)):
            row_issues.append(f"Invalid Return Date format: '{row.get(return_col)}'.")
            date_has_error = True

        # Chronological validation
        if b_ok and d_ok and b_date and d_date:
            if b_date > d_date:
                row_issues.append(f"Borrow Date ({b_date}) is after Due Date ({d_date}).")
                date_has_error = True
        if b_ok and r_ok and b_date and r_date:
            if b_date > r_date:
                row_issues.append(f"Borrow Date ({b_date}) is after Return Date ({r_date}).")
                date_has_error = True

        if date_has_error:
            invalid_date_records_count += 1

        # If any issues for this row, log them
        if row_issues:
            invalid_row_indices.add(idx)
            book_title_col = col_map.get("booktitle")
            title = str(row.get(book_title_col, "Unknown Title")) if book_title_col and pd.notna(row.get(book_title_col)) else "Unknown Title"
            category_col = col_map.get("category")
            category = str(row.get(category_col, "Uncategorized")) if category_col and pd.notna(row.get(category_col)) else "Uncategorized"
            student_col = col_map.get("studentid")
            student = str(row.get(student_col, "N/A")) if student_col and pd.notna(row.get(student_col)) else "N/A"

            issues_list.append({
                "row_number": row_num,
                "loan_id": loan_id,
                "book_title": title,
                "category": category,
                "student_id": student,
                "issue_count": len(row_issues),
                "issues": row_issues,
                "severity": "Warning" if not missing_fields else "Error",
            })

    duplicate_count = len([issue for issue in issues_list if any("Duplicate" in msg for msg in issue["issues"])])
    total_invalid = len(invalid_row_indices)
    total_valid = total_records - total_invalid

    return {
        "total_records": total_records,
        "total_valid_records": total_valid,
        "total_invalid_records": total_invalid,
        "duplicate_records": duplicate_count,
        "missing_value_records": missing_value_records_count,
        "invalid_date_records": invalid_date_records_count,
        "incomplete_records": incomplete_records_count,
        "validation_passed": total_invalid == 0,
        "issues": issues_list,
    }
