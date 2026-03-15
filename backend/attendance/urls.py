from django.urls import path
from .views import AttendanceListCreateView, AttendanceSummaryView

urlpatterns = [
    path("", AttendanceListCreateView.as_view(), name="attendance-list-create"),
    path("summary/", AttendanceSummaryView.as_view(), name="attendance-summary"),
]
