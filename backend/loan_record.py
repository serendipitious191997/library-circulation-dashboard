"""
loan_record.py
Object-Oriented Data Model for Library Borrowing Records.
Provides encapsulation for borrowing records, duration calculation,
and overdue status determination.
"""

from datetime import datetime, date
from typing import Optional, Dict, Any


class LoanRecord:
    """
    Represents an individual library book borrowing transaction.
    Demonstrates OOP principles (encapsulation, validation, helper methods).
    """

    def __init__(
        self,
        loan_id: str,
        book_id: str,
        book_title: str,
        category: str,
        student_id: str,
        borrow_date: Any,
        due_date: Any,
        return_date: Optional[Any] = None,
        loan_duration: Optional[int] = None,
    ):
        self.loan_id = str(loan_id).strip() if loan_id is not None else ""
        self.book_id = str(book_id).strip() if book_id is not None else ""
        self.book_title = str(book_title).strip() if book_title is not None else ""
        self.category = str(category).strip() if category is not None else ""
        self.student_id = str(student_id).strip() if student_id is not None else ""
        
        # Parse dates into datetime.date objects
        self.borrow_date = self._parse_date(borrow_date)
        self.due_date = self._parse_date(due_date)
        self.return_date = self._parse_date(return_date)
        
        # Loan duration in days (calculate if not explicitly provided or invalid)
        if loan_duration is not None and str(loan_duration).strip() != "":
            try:
                self.loan_duration = int(float(loan_duration))
            except (ValueError, TypeError):
                self.loan_duration = self.calculate_duration()
        else:
            self.loan_duration = self.calculate_duration()

    @staticmethod
    def _parse_date(date_val: Any) -> Optional[date]:
        """
        Safely converts various date formats (strings, timestamps, date objects)
        to a Python datetime.date.
        """
        if date_val is None:
            return None
        if isinstance(date_val, date) and not isinstance(date_val, datetime):
            return date_val
        if isinstance(date_val, datetime):
            return date_val.date()
        
        s = str(date_val).strip()
        if not s or s.lower() in ("nan", "none", "null", "nat", ""):
            return None

        # Try common date formats
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
                return datetime.strptime(s, fmt).date()
            except ValueError:
                continue

        # If ISO-like with T or extra characters
        try:
            return datetime.fromisoformat(s.split("T")[0]).date()
        except Exception:
            return None

    def calculate_duration(self) -> int:
        """
        Calculates loan duration in days:
        - If returned: return_date - borrow_date
        - If not returned yet: max(0, today - borrow_date)
        - Fallback: 0
        """
        if self.borrow_date and self.return_date:
            duration = (self.return_date - self.borrow_date).days
            return max(0, duration)
        elif self.borrow_date and not self.return_date:
            # Active ongoing loan
            duration = (date.today() - self.borrow_date).days
            return max(0, duration)
        return 0

    def is_returned(self) -> bool:
        """Checks if the book has been returned."""
        return self.return_date is not None

    def is_overdue(self, reference_date: Optional[date] = None) -> bool:
        """
        Determines whether the book is overdue.
        1. If returned: returned after due_date (return_date > due_date)
        2. If NOT returned: currently past due_date (reference_date > due_date)
        """
        ref = reference_date or date.today()
        
        if self.is_returned():
            if self.return_date and self.due_date:
                return self.return_date > self.due_date
            return False
        else:
            if self.due_date:
                return ref > self.due_date
            return False

    def is_currently_overdue(self, reference_date: Optional[date] = None) -> bool:
        """
        Specifically checks if a book has NOT been returned AND is overdue.
        """
        ref = reference_date or date.today()
        return (not self.is_returned()) and (self.due_date is not None) and (ref > self.due_date)

    def is_returned_late(self) -> bool:
        """
        Specifically checks if a book WAS returned, but past its due date.
        """
        return self.is_returned() and (self.return_date is not None) and (self.due_date is not None) and (self.return_date > self.due_date)

    def get_overdue_days(self, reference_date: Optional[date] = None) -> int:
        """
        Calculates overdue days.
        Returns 0 if not overdue.
        """
        ref = reference_date or date.today()
        if not self.due_date:
            return 0
        
        if self.is_returned():
            if self.return_date and self.return_date > self.due_date:
                return (self.return_date - self.due_date).days
            return 0
        else:
            if ref > self.due_date:
                return (ref - self.due_date).days
            return 0

    def get_status(self, reference_date: Optional[date] = None) -> str:
        """
        Returns a descriptive status for badges and displays:
        - 'Returned On Time'
        - 'Returned Overdue'
        - 'Currently Borrowed'
        - 'Currently Overdue'
        """
        ref = reference_date or date.today()
        if self.is_returned():
            if self.due_date and self.return_date and self.return_date > self.due_date:
                return "Returned Overdue"
            return "Returned On Time"
        else:
            if self.due_date and ref > self.due_date:
                return "Currently Overdue"
            return "Currently Borrowed"

    def to_dict(self, reference_date: Optional[date] = None) -> Dict[str, Any]:
        """Converts the record into a clean dictionary for JSON serialization."""
        ref = reference_date or date.today()
        return {
            "loan_id": self.loan_id,
            "book_id": self.book_id,
            "book_title": self.book_title,
            "category": self.category,
            "student_id": self.student_id,
            "borrow_date": self.borrow_date.isoformat() if self.borrow_date else None,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "return_date": self.return_date.isoformat() if self.return_date else None,
            "loan_duration": self.loan_duration,
            "is_returned": self.is_returned(),
            "is_overdue": self.is_overdue(ref),
            "is_currently_overdue": self.is_currently_overdue(ref),
            "is_returned_late": self.is_returned_late(),
            "overdue_days": self.get_overdue_days(ref),
            "status": self.get_status(ref),
        }
