from abc import ABC, abstractmethod
from django.db.models import Q
from rest_framework.views import APIView


class DataTableMixin(ABC):
    model = None
    serializer_class = None
    search_fields = []
    filter_fields = []
    sort_fields = []
    default_sort = []
    
    @abstractmethod
    def get_queryset(self):
        """Override this method to return your base queryset."""
        pass
    
    def apply_datatable_filters(self, queryset, request):
        """
        Apply search, filter, and sort to queryset.
        Returns the filtered and sorted queryset.
        """
        queryset = self.apply_search(queryset, request)
        queryset = self.apply_filters(queryset, request)
        queryset = self.apply_sorting(queryset, request)
        return queryset
    
    def apply_search(self, queryset, request):
        """Apply search functionality across search_fields."""
        search = request.query_params.get("search", "").strip()
        if not search or not self.search_fields:
            return queryset
        
        q_objects = Q()
        for field in self.search_fields:
            q_objects |= Q(**{f"{field}__icontains": search})
        
        return queryset.filter(q_objects)
    
    def apply_filters(self, queryset, request):
        """Apply exact match filters from filter_fields."""
        if not self.filter_fields:
            return queryset
        
        for field in self.filter_fields:
            value = request.query_params.get(field)
            if value is not None and value != "":
                queryset = queryset.filter(**{field: value})
        
        return queryset
    
    def apply_sorting(self, queryset, request):
        """Apply sorting based on sort parameter."""
        sort_by = request.query_params.get("sort", "").strip()
        
        if sort_by:
            if sort_by.startswith("-"):
                field = sort_by[1:]
                if field in self.sort_fields:
                    queryset = queryset.order_by(f"-{field}")
            else:
                if sort_by in self.sort_fields:
                    queryset = queryset.order_by(sort_by)
        elif self.default_sort:
            queryset = queryset.order_by(*self.default_sort)
        
        return queryset


class DataTableView(DataTableMixin, APIView):

    pagination_class = None
    
    def get(self, request):
        queryset = self.get_queryset()
        queryset = self.apply_datatable_filters(queryset, request)
        
        if self.pagination_class:
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)
            
            if page is not None:
                serializer = self.serializer_class(page, many=True)
                return paginator.get_paginated_response(serializer.data)
        
        serializer = self.serializer_class(queryset, many=True)
        from hrms.response import ApiResponse
        return ApiResponse.success(
            data=serializer.data,
            message="Records fetched successfully"
        )

