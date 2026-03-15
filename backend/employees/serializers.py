from rest_framework import serializers
from .exceptions import DuplicateEmployeeID, DuplicateEmail
from .models import Employee


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ["id", "employee_id", "full_name", "email", "department", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_employee_id(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Please provide an Employee ID.")
        return value.strip()

    def validate_full_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Please provide the employee's full name.")
        return value.strip()

    def validate_email(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Please provide a valid email address.")
        return value.strip().lower()

    def validate_department(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Please select a department.")
        return value.strip()

    def validate(self, attrs):
        if Employee.objects.filter(employee_id=attrs.get("employee_id")).exists():
            raise DuplicateEmployeeID()
        if Employee.objects.filter(email=attrs.get("email")).exists():
            raise DuplicateEmail()
        return attrs
