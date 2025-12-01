import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./index.css";

import App from "./routes/app";
import Dashboard from "./pages/dashboard";
import Attendance from "./pages/attendance";
import Children from "./pages/children";
import Billing from "./pages/billing";
import Scheduling from "./pages/scheduling";
import Messages from "./pages/messages";
import Media from "./pages/media";
import Reports from "./pages/reports";
import Calendar from "./pages/calendar";
import Staff from "./pages/staff";
import Settings from "./pages/settings";
import Login from "./pages/login";
import ParentPortal from "./pages/parent-portal";
import UserManagement from "./pages/user-management";
import Booking from "./pages/booking";
import ChatPage from "./pages/chat";
import Health from "./pages/health";
import { RBACProvider } from "./contexts/rbac";
import RouteError from "./routes/RouteError";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VerifyResetCodePage from "./pages/VerifyResetCodePage";
import BillingSuccess from "./pages/BillingSuccess";

// ⬇️ add these two files (see previous message for page code)

const router = createBrowserRouter([
  // Public routes
  { path: "/login", element: <Login />, errorElement: <RouteError /> },
  { path: "/logout", element: <Navigate to="/login" replace />, errorElement: <RouteError /> },

  // NEW: public reset page the email links to
    { path: "/verify-reset-code", element: <VerifyResetCodePage />, errorElement: <RouteError /> },

    { path: "/forgot-password", element: <ForgotPasswordPage />, errorElement: <RouteError /> },

  { path: "/reset-password", element: <ResetPasswordPage />, errorElement: <RouteError /> },

  // Private routes (inside App)
  {
    path: "/",
    element: <App />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "attendance", element: <Attendance /> },
      { path: "children", element: <Children /> },
      { path: "health", element: <Health /> },
      { path: "billing", element: <Billing /> },
       { path: "billing/success", element: <BillingSuccess /> },

      { path: "scheduling", element: <Scheduling /> },
      { path: "messages", element: <Messages /> },
      { path: "media", element: <Media /> },
      { path: "reports", element: <Reports /> },
      { path: "calendar", element: <Calendar /> },
      { path: "booking", element: <Booking /> },
      { path: "staff", element: <Staff /> },
      { path: "parent-portal", element: <ParentPortal /> },
      { path: "user-management", element: <UserManagement /> },
      { path: "chat", element: <ChatPage /> },
      { path: "settings", element: <Settings /> },
    ],
  },

  // Optional: catch-all 404
  { path: "*", element: <RouteError /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RBACProvider>
      <RouterProvider router={router} />
    </RBACProvider>
  </React.StrictMode>
);
