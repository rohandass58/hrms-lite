from django.db.models import Count, Q
from rest_framework.views import APIView

from hrms.datatable import DataTableMixin, DataTableView
from hrms.pagination import StandardPagination
from hrms.response import ApiResponse
from employees.models import Employee
from .models import Attendance
from .serializers import AttendanceSerializer


class AttendanceListCreateView(DataTableView):

    
    pagination_class = StandardPagination
    serializer_class = AttendanceSerializer
    
    search_fields = ["employee__full_name", "employee__employee_id", "employee__department"]
    filter_fields = ["employee_id", "date", "status", "employee__department"]
    sort_fields = ["date", "status", "created_at", "employee__full_name", "employee__employee_id", "employee__department"]
    default_sort = ["-date", "employee__full_name"]
    
    def get_queryset(self):
        return Attendance.objects.select_related("employee").all()

    def post(self, request):
        serializer = AttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return ApiResponse.created(
            data=serializer.data,
            message="Attendance marked successfully"
        )


class AttendanceSummaryView(DataTableMixin, APIView):
    
    pagination_class = StandardPagination
    
    search_fields = ["full_name", "employee_id", "department"]
    filter_fields = ["department"]
    sort_fields = ["full_name", "employee_id", "department", "total_present"]
    default_sort = ["full_name"]
    
    def get_queryset(self):
        return (
            Employee.objects.annotate(
                total_present=Count(
                    "attendances",
                    filter=Q(attendances__status="Present"),
                )
            )
        )

    def get(self, request):
        queryset = self.apply_datatable_filters(self.get_queryset(), request)
        
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            data = [
                {
                    "id": emp.id,
                    "employee_id": emp.employee_id,
                    "full_name": emp.full_name,
                    "department": emp.department,
                    "total_present": emp.total_present,
                }
                for emp in page
            ]
            return paginator.get_paginated_response(data)
        
        data = [
            {
                "id": emp.id,
                "employee_id": emp.employee_id,
                "full_name": emp.full_name,
                "department": emp.department,
                "total_present": emp.total_present,
            }
            for emp in queryset
        ]
        return ApiResponse.success(
            data=data,
            message="Attendance summary fetched successfully"
        )
