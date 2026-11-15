"""
analysis.py
Core analysis engine for the Library Circulation and Demand Dashboard.
Processes Pandas DataFrames using the LoanRecord class to calculate
borrowing statistics, category distributions, monthly trends, duration
distributions, overdue tracking, and export payloads.
"""

from datetime import datetime, date
from typing import Dict, Any, List, Optional
import pandas as pd
from loan_record import LoanRecord
from validation import normalize_column_name, validate_dataset


class LibraryAnalyzer:
    """
    Main analytics processor for library circulation records.
    Maintains parsed LoanRecord objects and provides aggregate statistics.
    """

    def __init__(self, df: Optional[pd.DataFrame] = None, reference_date: Optional[date] = None):
        self.reference_date = reference_date or date.today()
        self.raw_df = df if df is not None else pd.DataFrame()
        self.records: List[LoanRecord] = []
        self.validation_result: Dict[str, Any] = {}
        
        if not self.raw_df.empty:
            self.load_dataframe(self.raw_df)

    def load_dataframe(self, df: pd.DataFrame):
        """Loads and processes a DataFrame into LoanRecord objects."""
        self.raw_df = df.copy()
        self.validation_result = validate_dataset(self.raw_df)

        # Map column names to standard keys
        col_map = {normalize_column_name(c): c for c in df.columns}
        
        records = []
        for _, row in df.iterrows():
            loan_id = row.get(col_map.get("loanid", ""))
            book_id = row.get(col_map.get("bookid", ""))
            book_title = row.get(col_map.get("booktitle", ""))
            category = row.get(col_map.get("category", ""))
            student_id = row.get(col_map.get("studentid", ""))
            borrow_date = row.get(col_map.get("borrowdate", ""))
            due_date = row.get(col_map.get("duedate", ""))
            return_date = row.get(col_map.get("returndate", ""))
            loan_duration = row.get(col_map.get("loanduration", ""))

            rec = LoanRecord(
                loan_id=loan_id,
                book_id=book_id,
                book_title=book_title,
                category=category,
                student_id=student_id,
                borrow_date=borrow_date,
                due_date=due_date,
                return_date=return_date,
                loan_duration=loan_duration,
            )
            records.append(rec)

        self.records = records

    def get_records_dict(self) -> List[Dict[str, Any]]:
        """Returns all records as dictionaries."""
        return [r.to_dict(self.reference_date) for r in self.records]

    def get_dashboard_summary(self) -> Dict[str, Any]:
        """
        Calculates main dashboard statistic cards:
        - Total Borrowing Records
        - Total Books Borrowed (unique titles/IDs)
        - Overdue Books (currently overdue + returned late)
        - Average Loan Duration (days)
        - Most Popular Category
        """
        total_records = len(self.records)
        if total_records == 0:
            return {
                "total_records": 0,
                "total_books_borrowed": 0,
                "total_unique_students": 0,
                "overdue_books": 0,
                "currently_overdue": 0,
                "returned_late": 0,
                "average_loan_duration": 0.0,
                "most_popular_category": "N/A",
                "most_popular_category_count": 0,
                "active_loans": 0,
                "returned_loans": 0,
            }

        # Unique book count
        unique_books = len(set(r.book_id for r in self.records if r.book_id))
        if unique_books == 0:
            unique_books = len(set(r.book_title for r in self.records if r.book_title))
            
        unique_students = len(set(r.student_id for r in self.records if r.student_id))

        # Overdue counts
        currently_overdue = sum(1 for r in self.records if r.is_currently_overdue(self.reference_date))
        returned_late = sum(1 for r in self.records if r.is_returned_late())
        total_overdue = currently_overdue + returned_late

        # Durations
        durations = [r.loan_duration for r in self.records if r.loan_duration is not None and r.loan_duration > 0]
        avg_duration = round(sum(durations) / len(durations), 1) if durations else 0.0

        # Most popular category
        cat_counts = {}
        for r in self.records:
            cat = r.category or "Unknown"
            cat_counts[cat] = cat_counts.get(cat, 0) + 1

        most_popular = max(cat_counts.items(), key=lambda x: x[1]) if cat_counts else ("N/A", 0)

        active_loans = sum(1 for r in self.records if not r.is_returned())
        returned_loans = sum(1 for r in self.records if r.is_returned())

        return {
            "total_records": total_records,
            "total_books_borrowed": unique_books,
            "total_unique_students": unique_students,
            "overdue_books": total_overdue,
            "currently_overdue": currently_overdue,
            "returned_late": returned_late,
            "average_loan_duration": avg_duration,
            "most_popular_category": most_popular[0],
            "most_popular_category_count": most_popular[1],
            "active_loans": active_loans,
            "returned_loans": returned_loans,
        }

    def get_category_analysis(self) -> Dict[str, Any]:
        """
        Generates category-wise borrowing analysis:
        - Bar chart data (category, count, percentage)
        - Most borrowed category
        - Least borrowed category
        - Number of loans per category
        - Percentage distribution
        """
        total = len(self.records)
        if total == 0:
            return {
                "categories": [],
                "most_borrowed": {"category": "N/A", "count": 0, "percentage": 0.0},
                "least_borrowed": {"category": "N/A", "count": 0, "percentage": 0.0},
                "total_categories": 0,
            }

        counts: Dict[str, int] = {}
        for r in self.records:
            cat = r.category.strip() if r.category else "Uncategorized"
            counts[cat] = counts.get(cat, 0) + 1

        sorted_cats = sorted(counts.items(), key=lambda x: x[1], reverse=True)

        chart_data = []
        for cat, cnt in sorted_cats:
            pct = round((cnt / total) * 100, 1)
            chart_data.append({
                "category": cat,
                "loans": cnt,
                "percentage": pct,
            })

        most_borrowed = {
            "category": sorted_cats[0][0],
            "count": sorted_cats[0][1],
            "percentage": round((sorted_cats[0][1] / total) * 100, 1),
        }
        least_borrowed = {
            "category": sorted_cats[-1][0],
            "count": sorted_cats[-1][1],
            "percentage": round((sorted_cats[-1][1] / total) * 100, 1),
        }

        return {
            "categories": chart_data,
            "most_borrowed": most_borrowed,
            "least_borrowed": least_borrowed,
            "total_categories": len(sorted_cats),
        }

    def get_monthly_trends(self, year_filter: Optional[int] = None) -> Dict[str, Any]:
        """
        Generates monthly borrowing activity trends:
        - Number of loans per month
        - Monthly borrowing trends (chronologically ordered)
        - Highest borrowing month
        - Lowest borrowing month
        - Available years list for filtering
        """
        # Collect all valid borrow dates
        date_records = []
        available_years = set()

        for r in self.records:
            if r.borrow_date:
                available_years.add(r.borrow_date.year)
                if year_filter is None or r.borrow_date.year == year_filter:
                    date_records.append(r.borrow_date)

        years_list = sorted(list(available_years))
        
        if not date_records:
            return {
                "monthly_data": [],
                "highest_month": {"month": "N/A", "count": 0},
                "lowest_month": {"month": "N/A", "count": 0},
                "available_years": years_list,
                "selected_year": year_filter,
                "total_loans_in_period": 0,
            }

        # Group by YYYY-MM
        month_counts: Dict[str, int] = {}
        month_labels: Dict[str, str] = {}

        for d in date_records:
            key = d.strftime("%Y-%m")
            label = d.strftime("%B %Y") if year_filter is None else d.strftime("%B")
            month_counts[key] = month_counts.get(key, 0) + 1
            month_labels[key] = label

        # Sort chronologically
        sorted_keys = sorted(month_counts.keys())
        monthly_data = []
        for key in sorted_keys:
            monthly_data.append({
                "period": key,
                "month": month_labels[key],
                "loans": month_counts[key],
            })

        # Highest and lowest
        max_item = max(monthly_data, key=lambda x: x["loans"])
        min_item = min(monthly_data, key=lambda x: x["loans"])

        return {
            "monthly_data": monthly_data,
            "highest_month": {"month": max_item["month"], "count": max_item["loans"]},
            "lowest_month": {"month": min_item["month"], "count": min_item["loans"]},
            "available_years": years_list,
            "selected_year": year_filter,
            "total_loans_in_period": len(date_records),
        }

    def get_duration_analysis(self) -> Dict[str, Any]:
        """
        Generates loan duration analysis:
        - Average loan duration
        - Minimum loan duration
        - Maximum loan duration
        - Distribution into buckets:
          * 1–5 days
          * 6–10 days
          * 11–15 days
          * 16–20 days
          * More than 20 days
        """
        durations = [r.loan_duration for r in self.records if r.loan_duration is not None and r.loan_duration > 0]
        
        if not durations:
            return {
                "average_duration": 0.0,
                "min_duration": 0,
                "max_duration": 0,
                "distribution": [
                    {"group": "1–5 days", "count": 0, "percentage": 0.0},
                    {"group": "6–10 days", "count": 0, "percentage": 0.0},
                    {"group": "11–15 days", "count": 0, "percentage": 0.0},
                    {"group": "16–20 days", "count": 0, "percentage": 0.0},
                    {"group": "More than 20 days", "count": 0, "percentage": 0.0},
                ],
                "total_analyzed": 0,
            }

        avg_dur = round(sum(durations) / len(durations), 1)
        min_dur = min(durations)
        max_dur = max(durations)
        total_dur = len(durations)

        buckets = {
            "1–5 days": 0,
            "6–10 days": 0,
            "11–15 days": 0,
            "16–20 days": 0,
            "More than 20 days": 0,
        }

        for d in durations:
            if 1 <= d <= 5:
                buckets["1–5 days"] += 1
            elif 6 <= d <= 10:
                buckets["6–10 days"] += 1
            elif 11 <= d <= 15:
                buckets["11–15 days"] += 1
            elif 16 <= d <= 20:
                buckets["16–20 days"] += 1
            else:
                buckets["More than 20 days"] += 1

        dist_data = []
        for grp, cnt in buckets.items():
            pct = round((cnt / total_dur) * 100, 1) if total_dur > 0 else 0.0
            dist_data.append({
                "group": grp,
                "count": cnt,
                "percentage": pct,
            })

        return {
            "average_duration": avg_dur,
            "min_duration": min_dur,
            "max_duration": max_dur,
            "distribution": dist_data,
            "total_analyzed": total_dur,
        }

    def get_overdue_analysis(self) -> Dict[str, Any]:
        """
        Identifies and summarizes overdue books:
        - Returned after due date
        - Currently overdue and not yet returned (based on reference_date / today)
        - Overdue days calculated
        - Detailed list of overdue entries
        """
        overdue_records = []
        returned_late_count = 0
        currently_overdue_count = 0
        total_overdue_days = 0
        max_overdue_days = 0

        for r in self.records:
            if r.is_overdue(self.reference_date):
                days = r.get_overdue_days(self.reference_date)
                is_curr = r.is_currently_overdue(self.reference_date)
                is_late = r.is_returned_late()
                
                if is_curr:
                    currently_overdue_count += 1
                if is_late:
                    returned_late_count += 1
                    
                total_overdue_days += days
                if days > max_overdue_days:
                    max_overdue_days = days

                overdue_records.append({
                    "loan_id": r.loan_id,
                    "book_id": r.book_id,
                    "book_title": r.book_title,
                    "category": r.category,
                    "student_id": r.student_id,
                    "borrow_date": r.borrow_date.isoformat() if r.borrow_date else None,
                    "due_date": r.due_date.isoformat() if r.due_date else None,
                    "return_date": r.return_date.isoformat() if r.return_date else None,
                    "loan_duration": r.loan_duration,
                    "overdue_days": days,
                    "overdue_type": "Currently Overdue (Not Returned)" if is_curr else "Returned Late",
                    "status": r.get_status(self.reference_date),
                })

        # Sort by overdue days descending
        overdue_records.sort(key=lambda x: x["overdue_days"], reverse=True)

        avg_overdue_days = (
            round(total_overdue_days / len(overdue_records), 1) if overdue_records else 0.0
        )

        return {
            "total_overdue": len(overdue_records),
            "currently_overdue_count": currently_overdue_count,
            "returned_late_count": returned_late_count,
            "max_overdue_days": max_overdue_days,
            "average_overdue_days": avg_overdue_days,
            "records": overdue_records,
        }

    def generate_cleaned_dataframe(self) -> pd.DataFrame:
        """Generates a complete, cleaned DataFrame with calculated durations."""
        data = []
        for r in self.records:
            data.append({
                "Loan ID": r.loan_id,
                "Book ID": r.book_id,
                "Book Title": r.book_title,
                "Category": r.category,
                "Student ID": r.student_id,
                "Borrow Date": r.borrow_date.isoformat() if r.borrow_date else "",
                "Due Date": r.due_date.isoformat() if r.due_date else "",
                "Return Date": r.return_date.isoformat() if r.return_date else "",
                "Loan Duration": r.loan_duration,
                "Status": r.get_status(self.reference_date),
                "Overdue Days": r.get_overdue_days(self.reference_date),
            })
        return pd.DataFrame(data)
