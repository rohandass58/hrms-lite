import datetime
from rest_framework.views import APIView

from hrms.response import ApiResponse
from employees.models import Employee
from .models import Attendance


class DashboardView(APIView):

    def get(self, request):
        today = datetime.date.today()

        total_employees = Employee.objects.count()
        total_attendance_records = Attendance.objects.count()

        today_present = Attendance.objects.filter(date=today, status="Present").count()
        today_absent = Attendance.objects.filter(date=today, status="Absent").count()

        return ApiResponse.success(
            data={
                "total_employees": total_employees,
                "today_present": today_present,
                "today_absent": today_absent,
                "total_attendance_records": total_attendance_records,
            },
            message="Dashboard stats fetched successfully"
        )
