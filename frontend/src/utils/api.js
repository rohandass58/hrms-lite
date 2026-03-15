import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});


export async function handleApiCall(apiCall, defaultErrorMessage = "An error occurred") {
    try {
        const response = await apiCall();
        return response.data?.data;
    } catch (err) {
        const msg = err.response?.data?.message || defaultErrorMessage;
        const error = new Error(msg);
        error.status = err.response?.status;
        throw error;
    }
}


export function buildDatatableParams({ pagination = {}, sort = {}, search = "", filters = {} }) {
    const params = {};

    // Filters
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
            params[key] = value;
        }
    });

    // Search
    if (search) {
        params.search = search;
    }

    // Sort
    if (sort.column) {
        params.sort = sort.direction === "desc" ? `-${sort.column}` : sort.column;
    }

    // Pagination
    if (pagination.page) {
        params.page = pagination.page;
    }
    if (pagination.page_size) {
        params.page_size = pagination.page_size;
    }

    return params;
}


export function extractPaginatedData(response) {
    const data = response.data?.data || [];
    return {
        data: Array.isArray(data) ? data : [],
        pagination: {
            total: response.data?.total ?? 0,
            page: response.data?.page ?? 1,
            page_size: response.data?.page_size ?? 20,
            total_pages: response.data?.total_pages ?? 1,
            has_next: response.data?.has_next ?? false,
            has_previous: response.data?.has_previous ?? false,
        },
    };
}

