import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";

export default function App() {
    return (
        <ToastProvider>
            <BrowserRouter>
                <div className="flex min-h-screen bg-gray-50">
                    <Sidebar />

                    <div className="flex flex-col flex-1 ml-64 min-h-screen">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/employees" element={<Employees />} />
                            <Route path="/attendance" element={<Attendance />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </div>
            </BrowserRouter>
        </ToastProvider>
    );
}
