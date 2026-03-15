import { useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";

const columnHelper = createColumnHelper();

export default function Table({ 
    columns, 
    data, 
    onSort, 
    onSearch,
    searchValue = "",
    sortState = { column: null, direction: null }
}) {
    // Ensure data is an array
    const tableData = Array.isArray(data) ? data : [];

    // Transform columns to react-table format
    const tableColumns = useMemo(
        () =>
            columns.map((col) =>
                columnHelper.accessor(col.key, {
                    header: col.header,
                    cell: (info) => {
                        const row = info.row.original;
                        return col.render ? col.render(row[col.key], row) : row[col.key];
                    },
                    enableSorting: col.sortable !== false && onSort !== undefined,
                })
            ),
        [columns, onSort]
    );

    const table = useReactTable({
        data: tableData,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true, // Server-side sorting
        state: {
            sorting: sortState.column ? [{
                id: sortState.column,
                desc: sortState.direction === "desc"
            }] : [],
        },
    });

    const handleSort = (columnId) => {
        if (!onSort) return;
        
        const currentSort = sortState.column === columnId ? sortState.direction : null;
        let newDirection = "asc";
        
        if (currentSort === "asc") {
            newDirection = "desc";
        } else if (currentSort === "desc") {
            newDirection = null; // Clear sort
        }
        
        onSort(columnId, newDirection);
    };

    return (
        <div className="space-y-4">
            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const column = columns.find(col => col.key === header.id);
                                    const canSort = column?.sortable !== false && onSort !== undefined;
                                    const isSorted = sortState.column === header.id;
                                    const sortDirection = isSorted ? sortState.direction : null;

                                    return (
                                        <th
                                            key={header.id}
                                            className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                        >
                                            {canSort ? (
                                                <button
                                                    onClick={() => handleSort(header.id)}
                                                    className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    <span className="text-gray-400">
                                                        {sortDirection === "asc" ? "↑" : sortDirection === "desc" ? "↓" : "⇅"}
                                                    </span>
                                                </button>
                                            ) : (
                                                flexRender(header.column.columnDef.header, header.getContext())
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {table.getRowModel().rows.map((row, rowIndex) => (
                            <tr
                                key={row.id}
                                className={
                                    rowIndex % 2 === 0
                                        ? "hover:bg-gray-50 transition-colors"
                                        : "bg-gray-50/50 hover:bg-gray-100/70 transition-colors"
                                }
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {tableData.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No data available
                    </div>
                )}
            </div>
        </div>
    );
}
