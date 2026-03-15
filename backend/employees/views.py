from rest_framework.views import APIView
from hrms.datatable import DataTableView
from hrms.pagination import StandardPagination
from hrms.response import ApiResponse
from .models import Employee
from .serializers import EmployeeSerializer
from .exceptions import EmployeeNotFound


class EmployeeListCreateView(DataTableView):

    
    pagination_class = StandardPagination
    serializer_class = EmployeeSerializer
    
    # Datatable configuration
    search_fields = ["full_name", "employee_id", "email", "department"]
    filter_fields = ["department"]
    sort_fields = ["full_name", "employee_id", "email", "department", "created_at"]
    default_sort = ["full_name"]
    
    def get_queryset(self):
        return Employee.objects.all()

    def post(self, request):
        serializer = EmployeeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return ApiResponse.created(
            data=serializer.data,
            message="Employee created successfully"
        )


class EmployeeDetailView(APIView):

    def delete(self, request, pk):
        employee = Employee.objects.filter(pk=pk).first()
        if employee is None:
            raise EmployeeNotFound()
        employee.delete()
        return ApiResponse.no_content(message="Employee deleted successfully")
