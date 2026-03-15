import { useState, useEffect, useCallback, useRef } from "react";
import { useDebounce } from "./useDebounce";


export function useDataTable(fetchFunction, options = {}) {
    const {
        searchDelay = 500,
        initialFilters = {},
        pageSize = 20,
    } = options;

    // State
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState({ column: null, direction: null });
    const [filters, setFilters] = useState(initialFilters);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        page_size: pageSize,
        total_pages: 1,
        has_next: false,
        has_previous: false,
    });

    // Debounce search
    const debouncedSearch = useDebounce(search, searchDelay);

    // Use ref to store fetchFunction to avoid recreating on every render
    const fetchFunctionRef = useRef(fetchFunction);
    useEffect(() => {
        fetchFunctionRef.current = fetchFunction;
    }, [fetchFunction]);
    
    // Fetch data
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFunctionRef.current(
                {
                    page: currentPage,
                    page_size: pageSize,
                },
                sort,
                debouncedSearch,
                filters
            );
            setData(result.data || []);
            if (result.pagination) {
                setPagination(result.pagination);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentPage, sort, debouncedSearch, filters, pageSize]);

    // Fetch on dependencies change
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handlers
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSort = (column, direction) => {
        setSort({ column, direction });
        setCurrentPage(1); // Reset to first page on sort
    };

    const handleSearch = (value) => {
        setSearch(value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handleFilterChange = (filterNameOrObject, value) => {
        if (typeof filterNameOrObject === "object" && value === undefined) {
            // If object is passed, replace all filters
            setFilters(filterNameOrObject);
        } else {
            // If (name, value) is passed, update single filter
            setFilters((prev) => ({ ...prev, [filterNameOrObject]: value }));
        }
        setCurrentPage(1); // Reset to first page on filter change
    };

    const clearFilters = () => {
        setFilters(initialFilters);
        setSearch("");
        setSort({ column: null, direction: null });
        setCurrentPage(1);
    };

    const refetch = () => {
        fetchData();
    };

    return {
        // Data
        data,
        loading,
        error,
        pagination,
        
        // Search
        search,
        setSearch: handleSearch,
        
        // Sort
        sort,
        handleSort,
        
        // Pagination
        currentPage,
        handlePageChange,
        
        // Filters
        filters,
        setFilters: handleFilterChange,
        clearFilters,
        
        // Utilities
        refetch,
    };
}

