import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import AuthPage from "./pages/AuthPage";

// Forgot/Reset password pages
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Admin layout + pages
import AdminLayout from "./layouts/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import UsersPage from "./pages/admin/users/UsersPage";
import FormulairesPage from "./pages/admin/formulaires/FormulairesPage";
import QuestionsPage from "./pages/admin/questions/QuestionsPage";

// Client layout + pages (new nested layout)
import ClientLayout from "./layouts/ClientLayout";
import ClientOverview from "./pages/client/ClientOverview";
import FormulairesClientPage from "./pages/client/FormulairesClientPage";

// Other dashboards (keep fournisseur single-page for now)
import FournisseurDashboard from "./pages/FournisseurDashboard";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />

      {/* Auth */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* ADMIN area (left nav + nested pages) */}
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="formulaires" element={<FormulairesPage />} />
        <Route path="questions" element={<QuestionsPage />} />
      </Route>

      {/* CLIENT area (left nav + nested pages) */}
      <Route
        path="/dashboard/client"
        element={
          <ProtectedRoute roles={["CLIENT"]}>
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClientOverview />} />
        <Route path="formulaires" element={<FormulairesClientPage />} />
        {/* Optional extra routes for client can go here, e.g.: 
            <Route path="help" element={<ClientHelp />} /> */}
      </Route>

      {/* FOURNISSEUR single-page dashboard (unchanged) */}
      <Route
        path="/dashboard/fournisseur"
        element={
          <ProtectedRoute roles={["FOURNISSEUR"]}>
            <FournisseurDashboard />
          </ProtectedRoute>
        }
      />

      {/* Generic fallback for authenticated users without a specific dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}
