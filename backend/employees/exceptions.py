from hrms.exceptions import AppException
from rest_framework import status


class EmployeeNotFound(AppException):
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Employee not found."


class DuplicateEmployeeID(AppException):
    status_code = status.HTTP_409_CONFLICT
    detail = "This Employee ID is already in use. Please use a different Employee ID."


class DuplicateEmail(AppException):
    status_code = status.HTTP_409_CONFLICT
    detail = "This email address is already registered. Please use a different email."


