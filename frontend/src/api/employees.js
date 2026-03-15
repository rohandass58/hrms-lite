import { api, buildDatatableParams, extractPaginatedData } from "../utils/api";

export async function getAllEmployees(pagination = {}, sort = {}, search = "", filters = {}) {
    try {
        const params = buildDatatableParams({ pagination, sort, search, filters });
        const response = await api.get("/api/employees/", { params });
        return extractPaginatedData(response);
    } catch (err) {
        const msg = err.response?.data?.message || "Failed to fetch employees.";
        throw new Error(msg);
    }
}

export async function createEmployee(data) {
    try {
        const response = await api.post("/api/employees/", data);
        return response.data?.data;
    } catch (err) {
        const msg = err.response?.data?.message || "Failed to create employee.";
        const error = new Error(msg);
        error.status = err.response?.status;
        throw error;
    }
}

export async function deleteEmployee(id) {
    try {
        await api.delete(`/api/employees/${id}/`);
    } catch (err) {
        const msg = err.response?.data?.message || "Failed to delete employee.";
        throw new Error(msg);
    }
}
