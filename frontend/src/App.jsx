import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import Team from "./pages/Team";
import Blog from "./pages/Blog";
import Activities from "./pages/Activities";
import Premium from "./pages/Premium";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import SuperKids from "./pages/SuperKids";
import SuperKidsTest from "./pages/SuperKidsTest";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminStudents from "./pages/admin/Students";
import AdminRevenue from "./pages/admin/Revenue";
import AdminMedia from "./pages/admin/Media";
import AdminNotifications from "./pages/admin/Notifications";
import AdminSettings from "./pages/admin/Settings";
import AdminProfile from "./pages/admin/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout><Home /></Layout>} path="/" />
          <Route element={<Layout><Courses /></Layout>} path="/courses" />
          <Route element={<Layout><Team /></Layout>} path="/team" />
          <Route element={<Layout><Blog /></Layout>} path="/blog" />
          <Route element={<Layout><Premium /></Layout>} path="/premium" />
          <Route element={<Layout><Contact /></Layout>} path="/contact" />
          <Route element={<Layout><Activities /></Layout>} path="/activities" />
          <Route element={<Layout><SuperKids /></Layout>} path="/super-kids" />
          <Route element={<Layout><SuperKidsTest /></Layout>} path="/super-kids/:categoryId" />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="revenue" element={<AdminRevenue />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
          
          {/* Catch-all */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
