import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="pl-16 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;