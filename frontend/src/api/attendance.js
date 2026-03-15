import { api, buildDatatableParams, extractPaginatedData } from "../utils/api";

export async function getAllAttendance(filters = {}, pagination = {}, sort = {}, search = "") {
    try {
        const params = buildDatatableParams({ pagination, sort, search, filters });
        const response = await api.get("/api/attendance/", { params });
        return extractPaginatedData(response);
    } catch (err) {
        const msg = err.response?.data?.message || "Failed to fetch attendance records.";
        throw new Error(msg);
    }
}

export async function markAttendance(data) {
    try {
        const response = await api.post("/api/attendance/", data);
        return response.data?.data;
    } catch (err) {
        const msg = err.response?.data?.message || "Failed to mark attendance.";
        const error = new Error(msg);
        error.status = err.response?.status;
        throw error;
    }
}

export async function getAttendanceSummary(pagination = {}, sort = {}, search = "", filters = {}) {
    try {
        const params = buildDatatableParams({ pagination, sort, search, filters });
        const response = await api.get("/api/attendance/summary/", { params });
        return extractPaginatedData(response);
    } catch (err) {
        const msg = err.response?.data?.message || "Failed to fetch attendance summary.";
        throw new Error(msg);
    }
}

export async function getDashboardStats() {
    try {
        const response = await api.get("/api/dashboard/");
        return response.data?.data;
    } catch (err) {
        const msg = err.response?.data?.message || "Failed to fetch dashboard stats.";
        throw new Error(msg);
    }
}
