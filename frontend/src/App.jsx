import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { BalanceProvider } from "./context/BalanceContext";

// Layout Components
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

// Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/profile/Profile";
import Settings from "./pages/settings/Settings";

// Transaction Pages
import Transactions from "./pages/transactions/Transactions";
import TransactionDetail from "./pages/transactions/TransactionDetail";
import CreateTransaction from "./pages/transactions/CreateTransaction";

// Budget Pages
import Budgets from "./pages/budgets/Budgets";
import BudgetDetail from "./pages/budgets/BudgetDetail";
import CreateBudget from "./pages/budgets/CreateBudget";

// Category Pages
import Categories from "./pages/categories/Categories";
import CategoryDetail from "./pages/categories/CategoryDetail";
import CreateCategory from "./pages/categories/CreateCategory";

// Analytics Pages
import Analytics from "./pages/analytics/Analytics";
import Reports from "./pages/analytics/Reports";

// Settings Pages
import AccountSettings from "./pages/settings/AccountSettings";
import NotificationSettings from "./pages/settings/NotificationSettings";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff"
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff"
              }
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff"
              }
            }
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {" "}<BalanceProvider>
                  <Layout />{" "}
                </BalanceProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />

            {/* Transactions */}
            <Route path="transactions">
              <Route index element={<Transactions />} />
              <Route path="create" element={<CreateTransaction />} />
              <Route path=":id" element={<TransactionDetail />} />
            </Route>

            {/* Budgets */}
            <Route path="budgets">
              <Route index element={<Budgets />} />
              <Route path="create" element={<CreateBudget />} />
              <Route path=":id" element={<BudgetDetail />} />
            </Route>

            {/* Categories */}
            <Route path="categories">
              <Route index element={<Categories />} />
              <Route path="create" element={<CreateCategory />} />
              <Route path=":id" element={<CategoryDetail />} />
            </Route>

            {/* Analytics */}
            <Route path="analytics">
              <Route index element={<Analytics />} />
              <Route path="reports" element={<Reports />} />
            </Route>

            {/* Settings */}
            <Route path="settings">
              <Route index element={<Settings />} />
              <Route path="account" element={<AccountSettings />} />
              <Route path="notifications" element={<NotificationSettings />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
