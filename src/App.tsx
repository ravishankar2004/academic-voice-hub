
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./context/UserContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/student/Dashboard";
import TeacherDashboard from "./pages/teacher/Dashboard";
import StudentResults from "./pages/student/Results";
import ManageResults from "./pages/teacher/ManageResults";
import AddResult from "./pages/teacher/AddResult";
import Analytics from "./pages/teacher/Analytics";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Student Routes */}
            <Route path="/student-dashboard" element={
              <ProtectedRoute requiredUserType="student">
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/results" element={
              <ProtectedRoute requiredUserType="student">
                <StudentResults />
              </ProtectedRoute>
            } />
            
            {/* Teacher Routes */}
            <Route path="/teacher-dashboard" element={
              <ProtectedRoute requiredUserType="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/teacher/manage-results" element={
              <ProtectedRoute requiredUserType="teacher">
                <ManageResults />
              </ProtectedRoute>
            } />
            <Route path="/teacher/add-result" element={
              <ProtectedRoute requiredUserType="teacher">
                <AddResult />
              </ProtectedRoute>
            } />
            <Route path="/teacher/analytics" element={
              <ProtectedRoute requiredUserType="teacher">
                <Analytics />
              </ProtectedRoute>
            } />
            
            {/* Not Found Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
