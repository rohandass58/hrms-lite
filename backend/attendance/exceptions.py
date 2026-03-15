from hrms.exceptions import AppException
from rest_framework import status


class DuplicateAttendance(AppException):
    status_code = status.HTTP_409_CONFLICT
    detail = "Attendance for this employee has already been marked for the selected date. Please choose a different date or employee."
