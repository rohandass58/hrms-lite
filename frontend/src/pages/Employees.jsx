import { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import { useDataTable } from "../hooks/useDataTable";
import Navbar from "../components/Navbar";
import Table from "../components/Table";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { getAllEmployees, createEmployee, deleteEmployee } from "../api/employees";

const initialForm = { employee_id: "", full_name: "", email: "", department: "" };
const requiredFields = ["employee_id", "full_name", "email", "department"];

function validateForm(form) {
    const errors = {};
    if (!form.employee_id.trim()) errors.employee_id = "Employee ID is required.";
    if (!form.full_name.trim()) errors.full_name = "Full name is required.";
    if (!form.email.trim()) {
        errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        errors.email = "Enter a valid email address.";
    }
    if (!form.department.trim()) errors.department = "Department is required.";
    return errors;
}

export default function Employees() {
    const toast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Use datatable hook for all table operations
    const {
        data: employees,
        loading,
        error,
        pagination,
        search,
        setSearch,
        sort,
        handleSort,
        currentPage,
        handlePageChange,
        refetch,
    } = useDataTable(getAllEmployees);

    function openModal() {
        setForm(initialForm);
        setFieldErrors({});
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
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
            const newEmployee = await createEmployee({
                employee_id: form.employee_id.trim(),
                full_name: form.full_name.trim(),
                email: form.email.trim().toLowerCase(),
                department: form.department.trim(),
            });
            closeModal();
            refetch();
            toast.success("Employee created successfully!");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id) {
        try {
            await deleteEmployee(id);
            setDeleteConfirm(null);
            refetch();
            toast.success("Employee deleted successfully!");
        } catch (err) {
            toast.error(err.message);
        }
    }

    const columns = [
        { key: "employee_id", header: "Employee ID" },
        { key: "full_name", header: "Full Name" },
        { key: "email", header: "Email" },
        { key: "department", header: "Department" },
        {
            key: "created_at",
            header: "Added On",
            render: (val) => new Date(val).toLocaleDateString("en-IN", { dateStyle: "medium" }),
        },
        {
            key: "id",
            header: "Actions",
            sortable: false,
            render: (val, row) => (
                <button
                    onClick={() => setDeleteConfirm(row)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
                >
                    Delete
                </button>
            ),
        },
    ];

    const inputClass = (field) =>
        `w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${fieldErrors[field]
            ? "border-red-400 focus:ring-red-400"
            : "border-gray-300"
        }`;

    return (
        <div className="flex flex-col flex-1">
            <Navbar title="Employees" />
            <main className="p-6 flex-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div>
                            <h2 className="text-base font-semibold text-gray-800">All Employees</h2>
                            <p className="text-sm text-gray-500">
                                {pagination.total} employee{pagination.total !== 1 ? "s" : ""} total
                            </p>
                        </div>
                        <button
                            onClick={openModal}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Employee
                        </button>
                    </div>

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
                                            placeholder="Search employees..."
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

                                {employees.length === 0 ? (
                                    <EmptyState
                                        icon="👤"
                                        title={search ? "No employees match your search" : "No employees found"}
                                        description={
                                            search
                                                ? "Try adjusting your search or clear it to see all employees."
                                                : "Add your first employee using the button above."
                                        }
                                    />
                                ) : (
                                    <>
                                        <Table 
                                            columns={columns} 
                                            data={employees}
                                            onSort={handleSort}
                                            onSearch={setSearch}
                                            searchValue={search}
                                            sortState={sort}
                                        />
                                        {pagination.total_pages > 1 && (
                                            <div className="mt-6 pt-6 border-t border-gray-200">
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-sm text-gray-600">
                                                        Showing {((currentPage - 1) * pagination.page_size) + 1} to{" "}
                                                        {Math.min(currentPage * pagination.page_size, pagination.total)} of{" "}
                                                        {pagination.total} employees
                                                    </p>
                                                </div>
                                                <Pagination
                                                    currentPage={currentPage}
                                                    totalPages={pagination.total_pages}
                                                    onPageChange={handlePageChange}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Add Employee Modal */}
            <Modal isOpen={modalOpen} onClose={closeModal} title="Add Employee">
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    {[
                        { name: "employee_id", label: "Employee ID", type: "text", placeholder: "e.g. EMP001" },
                        { name: "full_name", label: "Full Name", type: "text", placeholder: "e.g. Jane Doe" },
                        { name: "email", label: "Email", type: "email", placeholder: "e.g. jane@company.com" },
                        { name: "department", label: "Department", type: "text", placeholder: "e.g. Engineering" },
                    ].map(({ name, label, type, placeholder }) => (
                        <div key={name}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {label} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type={type}
                                name={name}
                                value={form[name]}
                                onChange={handleChange}
                                placeholder={placeholder}
                                className={inputClass(name)}
                            />
                            {fieldErrors[name] && (
                                <p className="mt-1 text-xs text-red-500">{fieldErrors[name]}</p>
                            )}
                        </div>
                    ))}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                        >
                            {submitting ? "Adding..." : "Add Employee"}
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Employee">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-gray-800">{deleteConfirm?.full_name}</span>?
                        This will also remove all their attendance records.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleDelete(deleteConfirm.id)}
                            className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                        >
                            Delete
                        </button>
                        <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
