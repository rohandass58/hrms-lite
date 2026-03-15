from datetime import date
from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from employees.models import Employee
from .exceptions import DuplicateAttendance
from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    employee_employee_id = serializers.CharField(source="employee.employee_id", read_only=True)
    department = serializers.CharField(source="employee.department", read_only=True)

    class Meta:
        model = Attendance
        fields = [
            "id",
            "employee",
            "employee_name",
            "employee_employee_id",
            "department",
            "date",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        validators = [
            UniqueTogetherValidator(
                queryset=Attendance.objects.all(),
                fields=["employee", "date"],
                message="Attendance for this employee has already been marked for the selected date. Please choose a different date or employee."
            )
        ]

    def validate_employee(self, value):
        if value is None:
            raise serializers.ValidationError("Please select an employee.")
        return value

    def validate_date(self, value):
        if value is None:
            raise serializers.ValidationError("Please select a date.")
        today = date.today()
        current_year_start = date(today.year, 1, 1)
        if value > today:
            raise serializers.ValidationError("Cannot mark attendance for future dates. Please select today's date or a past date.")
        if value < current_year_start:
            raise serializers.ValidationError("Cannot mark attendance for dates before this year. Please select a date from this year only.")
        return value

    def validate_status(self, value):
        valid_statuses = {choice[0] for choice in Attendance.STATUS_CHOICES}
        if not value or value not in valid_statuses:
            raise serializers.ValidationError("Please select either 'Present' or 'Absent' as the status.")
        return value

