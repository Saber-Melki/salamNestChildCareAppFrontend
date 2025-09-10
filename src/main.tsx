import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import "./index.css"

import App from "./routes/app"
import Dashboard from "./pages/dashboard"
import Attendance from "./pages/attendance"
import Children from "./pages/children"
import Health from "./pages/health"
import Billing from "./pages/billing"
import Scheduling from "./pages/scheduling"
import Messages from "./pages/messages"
import Media from "./pages/media"
import Reports from "./pages/reports"
import Calendar from "./pages/calendar"
import Staff from "./pages/staff"
import Settings from "./pages/settings"
import Login from "./pages/login"
import Logout from "./pages/logout"
import ParentPortal from "./pages/parent-portal"
import UserManagement from "./pages/user-management"

const router = createBrowserRouter([
  // Routes publiques
  { path: "/login", element: <Login /> },
  { path: "/logout", element: <Navigate to="/login" replace /> },

  // Routes privées (dans App)
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> }, // redirection par défaut vers login
      { path: "dashboard", element: <Dashboard /> },
      { path: "attendance", element: <Attendance /> },
      { path: "children", element: <Children /> },
      { path: "health", element: <Health /> },
      { path: "billing", element: <Billing /> },
      { path: "scheduling", element: <Scheduling /> },
      { path: "messages", element: <Messages /> },
      { path: "media", element: <Media /> },
      { path: "reports", element: <Reports /> },
      { path: "calendar", element: <Calendar /> },
      { path: "staff", element: <Staff /> },
      { path: "parent-portal", element: <ParentPortal /> },
      { path: "user-management", element: <UserManagement /> },
      { path: "settings", element: <Settings /> },
    ],
  },
])


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
