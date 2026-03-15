from rest_framework.pagination import PageNumberPagination
from hrms.response import ApiResponse


class StandardPagination(PageNumberPagination):
    """Custom pagination class that integrates with ApiResponse format."""
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_paginated_response(self, data):
        """Return a paginated response using ApiResponse format."""
        return ApiResponse.success(
            data=data,
            message="Records fetched successfully",
            total=self.page.paginator.count,
            page=self.page.number,
            page_size=self.page_size,
            total_pages=self.page.paginator.num_pages,
            has_next=self.page.has_next(),
            has_previous=self.page.has_previous(),
        )

