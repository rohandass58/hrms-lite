import { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import { useDataTable } from "../hooks/useDataTable";
import Navbar from "../components/Navbar";
import Table from "../components/Table";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Pagination from "../components/Pagination";
import { getAllAttendance, markAttendance } from "../api/attendance";
import { getAllEmployees } from "../api/employees";

function todayString() {
    return new Date().toISOString().split("T")[0];
}

function currentYearStartString() {
    const today = new Date();
    return `${today.getFullYear()}-01-01`;
}

const initialForm = { employee: "", date: todayString(), status: "" };

function validateForm(form) {
    const errors = {};
    if (!form.employee) errors.employee = "Employee is required.";
    if (!form.date) {
        errors.date = "Date is required.";
        } else {
            // Validate date format (YYYY-MM-DD)
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(form.date)) {
                errors.date = "Invalid date format. Please select a valid date.";
            } else {
                const selectedDate = new Date(form.date + "T00:00:00");
                const today = new Date();
                today.setHours(23, 59, 59, 999); // Set to end of today
                
                const currentYear = today.getFullYear();
                const yearStart = new Date(currentYear, 0, 1); // January 1st of current year
                
                // Check if date is valid
                if (isNaN(selectedDate.getTime())) {
                    errors.date = "Invalid date. Please select a valid date.";
                } else if (selectedDate > today) {
                    errors.date = "Cannot mark attendance for future dates. Please select today's date or a past date.";
                } else if (selectedDate < yearStart) {
                    errors.date = "Cannot mark attendance for dates before this year. Please select a date from this year only.";
                }
            }
        }
    if (!form.status) errors.status = "Status is required.";
    return errors;
}

export default function Attendance() {
    const toast = useToast();
    const [employees, setEmployees] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [filterEmployee, setFilterEmployee] = useState("");
    const [filterDate, setFilterDate] = useState("");

    // Use datatable hook for all table operations
    const {
        data: records,
        loading,
        error,
        pagination,
        search,
        setSearch,
        sort,
        handleSort,
        currentPage,
        handlePageChange,
        filters,
        setFilters,
        refetch,
    } = useDataTable(
        (pagination, sort, search, filters) => getAllAttendance(filters, pagination, sort, search),
        { initialFilters: {} }
    );

    // Update filters when filterEmployee or filterDate changes
    useEffect(() => {
        setFilters({
            employee_id: filterEmployee || "",
            date: filterDate || "",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterEmployee, filterDate]);

    useEffect(() => {
        getAllEmployees()
            .then((result) => {
                if (Array.isArray(result)) {
                    setEmployees(result);
                } else {
                    setEmployees(result.data || []);
                }
            })
            .catch(() => { });
    }, []);

    function openModal() {
        setForm({ ...initialForm, date: todayString() });
        setFieldErrors({});
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
    }

    function handleChange(e) {
        const { name, value } = e.target;
        let processedValue = value;
        
        if (name === "date" && value) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(value)) {
                processedValue = todayString();
            }
        }
        
        setForm((prev) => ({ ...prev, [name]: processedValue }));
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const errors = validateForm(form);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        setSubmitting(true);
        try {
            const dateToSend = form.date && /^\d{4}-\d{2}-\d{2}$/.test(form.date) 
                ? form.date 
                : todayString();
            
            await markAttendance({
                employee: Number(form.employee),
                date: dateToSend,
                status: form.status,
            });
            closeModal();
            refetch();
            toast.success("Attendance marked successfully!");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    function clearFilters() {
        setFilterEmployee("");
        setFilterDate("");
        setSearch("");
    }


    const columns = [
        { key: "employee_name", header: "Employee Name" },
        { key: "department", header: "Department" },
        {
            key: "date",
            header: "Date",
            render: (val) =>
                new Date(val + "T00:00:00").toLocaleDateString("en-IN", { dateStyle: "medium" }),
        },
        {
            key: "status",
            header: "Status",
            render: (val) => (
                <Badge
                    label={val}
                    variant={val === "Present" ? "success" : "danger"}
                />
            ),
        },
    ];

    const selectClass = (field) =>
        `w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors bg-white ${fieldErrors[field] ? "border-red-400 focus:ring-red-400" : "border-gray-300"
        }`;

    const hasFilters = filterEmployee || filterDate || search;

    return (
        <div className="flex flex-col flex-1">
            <Navbar title="Attendance" />
            <main className="p-6 flex-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-gray-100">
                        <div className="flex flex-wrap gap-3 flex-1 min-w-0">
                            <select
                                value={filterEmployee}
                                onChange={(e) => setFilterEmployee(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[180px]"
                            >
                                <option value="">All Employees</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.full_name}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />

                            {hasFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="px-3 py-2 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>

                        <button
                            onClick={openModal}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Mark Attendance
                        </button>
                    </div>

                    {/* Table area */}
                    <div className="p-6">
                        {loading && <LoadingSpinner />}
                        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
                        {!loading && !error && (
                            <>
                                {/* Search Bar - Always visible */}
                                <div className="mb-4">
                                    <div className="relative flex-1 max-w-md">
                                        <input
                                            type="text"
                                            placeholder="Search attendance..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
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
                                        {search && (
                                            <button
                                                onClick={() => setSearch("")}
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

                                {records.length === 0 ? (
                                    <EmptyState
                                        icon="📅"
                                        title={hasFilters ? "No records match your filters" : "No attendance records"}
                                        description={
                                            hasFilters
                                                ? "Try adjusting or clearing your filters."
                                                : "Use the Mark Attendance button to get started."
                                        }
                                    />
                                ) : (
                                    <>
                                        <Table 
                                            columns={columns} 
                                            data={records}
                                            onSort={handleSort}
                                            onSearch={setSearch}
                                            searchValue={search}
                                            sortState={sort}
                                        />
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm text-gray-600">
                                            Showing {((currentPage - 1) * pagination.page_size) + 1} to{" "}
                                            {Math.min(currentPage * pagination.page_size, pagination.total)} of{" "}
                                            {pagination.total} records
                                        </p>
                                    </div>
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={pagination.total_pages}
                                            onPageChange={handlePageChange}
                                        />
                                    </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Mark Attendance Modal */}
            <Modal isOpen={modalOpen} onClose={closeModal} title="Mark Attendance">
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Employee <span className="text-red-500">*</span>
                        </label>
                        <select name="employee" value={form.employee} onChange={handleChange} className={selectClass("employee")}>
                            <option value="">Select employee…</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.full_name} ({emp.employee_id})
                                </option>
                            ))}
                        </select>
                        {fieldErrors.employee && (
                            <p className="mt-1 text-xs text-red-500">{fieldErrors.employee}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            min={currentYearStartString()}
                            max={todayString()}
                            className={selectClass("date")}
                        />
                        {fieldErrors.date && (
                            <p className="mt-1 text-xs text-red-500">{fieldErrors.date}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4 mt-2">
                            {["Present", "Absent"].map((s) => (
                                <label key={s} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value={s}
                                        checked={form.status === s}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span
                                        className={`text-sm font-medium ${s === "Present" ? "text-green-700" : "text-red-700"
                                            }`}
                                    >
                                        {s}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {fieldErrors.status && (
                            <p className="mt-1 text-xs text-red-500">{fieldErrors.status}</p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                        >
                            {submitting ? "Saving..." : "Mark Attendance"}
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
