import { useState, useEffect } from "react";
import { useDataTable } from "../hooks/useDataTable";
import Navbar from "../components/Navbar";
import Table from "../components/Table";
import Pagination from "../components/Pagination";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { getDashboardStats, getAttendanceSummary } from "../api/attendance";

const statCards = [
    {
        key: "total_employees",
        label: "Total Employees",
        color: "bg-blue-50 border-blue-200",
        textColor: "text-blue-700",
        iconBg: "bg-blue-100",
        icon: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
    {
        key: "today_present",
        label: "Present Today",
        color: "bg-green-50 border-green-200",
        textColor: "text-green-700",
        iconBg: "bg-green-100",
        icon: (
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        key: "today_absent",
        label: "Absent Today",
        color: "bg-red-50 border-red-200",
        textColor: "text-red-700",
        iconBg: "bg-red-100",
        icon: (
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        key: "total_attendance_records",
        label: "Total Records",
        color: "bg-purple-50 border-purple-200",
        textColor: "text-purple-700",
        iconBg: "bg-purple-100",
        icon: (
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
    },
];

const summaryColumns = [
    { key: "full_name", header: "Employee Name", sortable: true },
    { key: "department", header: "Department", sortable: true },
    {
        key: "total_present",
        header: "Total Present Days",
        sortable: true,
        render: (val) => (
            <span className="font-semibold text-green-600">{val}</span>
        ),
    },
];

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState(null);

    // Use datatable hook for summary table
    const {
        data: summary,
        loading: summaryLoading,
        error: summaryError,
        pagination: summaryPagination,
        search: summarySearch,
        setSearch: setSummarySearch,
        sort: summarySort,
        handleSort: handleSummarySort,
        currentPage: summaryPage,
        handlePageChange: handleSummaryPageChange,
    } = useDataTable(
        (pagination, sort, search) => getAttendanceSummary(pagination, sort, search)
    );

    // Fetch dashboard stats
    useEffect(() => {
        async function fetchStats() {
            setStatsLoading(true);
            setStatsError(null);
            try {
                const statsData = await getDashboardStats();
                setStats(statsData);
            } catch (err) {
                setStatsError(err.message);
            } finally {
                setStatsLoading(false);
            }
        }
        fetchStats();
    }, []);

    const loading = statsLoading || summaryLoading;
    const error = statsError || summaryError;

    return (
        <div className="flex flex-col flex-1">
            <Navbar title="Dashboard" />
            <main className="p-6 flex-1">
                {loading && <LoadingSpinner />}
                {!loading && error && <ErrorState message={error} onRetry={() => window.location.reload()} />}
                {!loading && !error && stats && (
                    <>
                        {/* Stat Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                            {statCards.map((card) => (
                                <div
                                    key={card.key}
                                    className={`bg-white rounded-xl border ${card.color} p-6 shadow-sm flex items-center gap-4`}
                                >
                                    <div className={`${card.iconBg} rounded-xl p-3 flex-shrink-0`}>
                                        {card.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                                        <p className={`text-3xl font-bold ${card.textColor} mt-0.5`}>
                                            {stats[card.key] ?? 0}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-base font-semibold text-gray-800 mb-4">
                                Employee Attendance Summary
                            </h2>
                            
                            {/* Search Bar - Always visible */}
                            <div className="mb-4">
                                <div className="relative flex-1 max-w-md">
                                    <input
                                        type="text"
                                        placeholder="Search employees..."
                                        value={summarySearch}
                                        onChange={(e) => setSummarySearch(e.target.value)}
                                        className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                    <svg
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                    {summarySearch && (
                                        <button
                                            onClick={() => setSummarySearch("")}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            aria-label="Clear search"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {summary.length === 0 ? (
                                <EmptyState
                                    icon="📋"
                                    title={summarySearch ? "No employees match your search" : "No Data Available"}
                                    description={
                                        summarySearch
                                            ? "Try adjusting your search or clear it to see all employees."
                                            : "Add employees and mark attendance to see the summary."
                                    }
                                />
                            ) : (
                                <>
                                    <Table 
                                        columns={summaryColumns} 
                                        data={summary}
                                        onSort={handleSummarySort}
                                        onSearch={setSummarySearch}
                                        searchValue={summarySearch}
                                        sortState={summarySort}
                                    />
                                    {summaryPagination.total_pages > 1 && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-sm text-gray-600">
                                                    Showing {((summaryPage - 1) * summaryPagination.page_size) + 1} to{" "}
                                                    {Math.min(summaryPage * summaryPagination.page_size, summaryPagination.total)} of{" "}
                                                    {summaryPagination.total} employees
                                                </p>
                                            </div>
                                            <Pagination
                                                currentPage={summaryPage}
                                                totalPages={summaryPagination.total_pages}
                                                onPageChange={handleSummaryPageChange}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
