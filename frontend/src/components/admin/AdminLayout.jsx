import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminSidebar, { MobileHeader } from "./AdminSidebar";

export function AdminLayout() {
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    setIsAuthenticated(!!token);
    setChecking(false);
  }, []);

  // While checking token
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not logged in → redirect
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <AdminSidebar />
      <main className="md:pl-16 pt-14 md:pt-0 min-h-screen w-full">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
