import { useState } from "react";
import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";

import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MapPin,
  ClipboardList,
  BarChart3,
  Settings,
  Bell,
  Search,
  Check,
  X,
} from "lucide-react";

import "./App.css";

import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Registrations from "./pages/Registrations";
import Participants from "./pages/Participants";
import Venues from "./pages/Venues";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/Settings";

function ProtectedRoute({ children }) {
  const accessToken =
    localStorage.getItem("college_event_access") ||
    localStorage.getItem("access_token");

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const [showNotifications, setShowNotifications] =
    useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New event registration",
      message:
        "A participant registered for Tech Fest 2026.",
      time: "10 minutes ago",
      unread: true,
    },
    {
      id: 2,
      title: "Event reminder",
      message:
        "Tech Fest 2026 is coming up soon.",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      title: "Registration update",
      message:
        "A participant registration was cancelled.",
      time: "3 hours ago",
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const markAllAsRead = () => {
    setNotifications((old) =>
      old.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  const markAsRead = (id) => {
    setNotifications((old) =>
      old.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              unread: false,
            }
          : notification
      )
    );
  };

  return (
    <Routes>

      {/* =========================
          LOGIN
      ========================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      {/* =========================
          MAIN APPLICATION
      ========================== */}

      <Route
        path="*"
        element={
          <div className="app-container">

            {/* =========================
                SIDEBAR
            ========================== */}

            <aside className="sidebar">

              <div className="logo-section">

                <div className="logo-icon">
                  E
                </div>

                <div>
                  <h2>EventHub</h2>
                  <p>College Events</p>
                </div>

              </div>

              <nav className="sidebar-nav">

                <p className="menu-title">
                  MAIN MENU
                </p>

                <NavLink
                  to="/"
                  end
                  className="nav-item"
                >
                  <LayoutDashboard size={19} />
                  <span>Dashboard</span>
                </NavLink>

                <NavLink
                  to="/events"
                  className="nav-item"
                >
                  <CalendarDays size={19} />
                  <span>Events</span>
                </NavLink>

                <NavLink
                  to="/registrations"
                  className="nav-item"
                >
                  <ClipboardList size={19} />
                  <span>My Registrations</span>
                </NavLink>

                <NavLink
                  to="/participants"
                  className="nav-item"
                >
                  <Users size={19} />
                  <span>Participants</span>
                </NavLink>

                <NavLink
                  to="/venues"
                  className="nav-item"
                >
                  <MapPin size={19} />
                  <span>Venues</span>
                </NavLink>

                <p className="menu-title management-title">
                  MANAGEMENT
                </p>

                <NavLink
                  to="/reports"
                  className="nav-item"
                >
                  <BarChart3 size={19} />
                  <span>Reports</span>
                </NavLink>

                <NavLink
                  to="/settings"
                  className="nav-item"
                >
                  <Settings size={19} />
                  <span>Settings</span>
                </NavLink>

              </nav>

              <div className="sidebar-bottom">

                <div className="profile-mini">

                  <div className="avatar">
                    P
                  </div>

                  <div className="profile-info">

                    <strong>
                      Pranjal Hon
                    </strong>

                    <span>
                      Student
                    </span>

                  </div>

                </div>

              </div>

            </aside>

            {/* =========================
                MAIN CONTENT
            ========================== */}

            <main className="main-content">

              {/* =========================
                  TOPBAR
              ========================== */}

              <header className="topbar">

                <div className="search-box">

                  <Search size={18} />

                  <input
                    type="text"
                    placeholder="Search events..."
                  />

                </div>

                <div className="topbar-actions">

                  {/* =========================
                      NOTIFICATIONS
                  ========================== */}

                  <div className="notification-wrapper">

                    <button
                      className="icon-button notification-button"
                      type="button"
                      aria-label="Notifications"
                      onClick={() =>
                        setShowNotifications(
                          (old) => !old
                        )
                      }
                    >

                      <Bell size={20} />

                      {unreadCount > 0 && (
                        <span className="notification-dot">
                          {unreadCount}
                        </span>
                      )}

                    </button>

                    {showNotifications && (

                      <div className="notification-dropdown">

                        <div className="notification-header">

                          <div>

                            <h3>
                              Notifications
                            </h3>

                            <span>
                              {unreadCount > 0
                                ? `${unreadCount} unread`
                                : "All caught up"}
                            </span>

                          </div>

                          <button
                            type="button"
                            className="notification-close"
                            onClick={() =>
                              setShowNotifications(
                                false
                              )
                            }
                            aria-label="Close notifications"
                          >
                            <X size={17} />
                          </button>

                        </div>

                        <div className="notification-list">

                          {notifications.length === 0 ? (

                            <div className="no-notifications">

                              <Bell size={24} />

                              <p>
                                No notifications
                              </p>

                            </div>

                          ) : (

                            notifications.map(
                              (notification) => (

                                <div
                                  key={
                                    notification.id
                                  }
                                  className={`notification-item ${
                                    notification.unread
                                      ? "unread"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    markAsRead(
                                      notification.id
                                    )
                                  }
                                >

                                  <div className="notification-icon">

                                    <Bell size={16} />

                                  </div>

                                  <div className="notification-content">

                                    <strong>
                                      {
                                        notification.title
                                      }
                                    </strong>

                                    <p>
                                      {
                                        notification.message
                                      }
                                    </p>

                                    <span>
                                      {
                                        notification.time
                                      }
                                    </span>

                                  </div>

                                  {notification.unread && (
                                    <span className="unread-indicator" />
                                  )}

                                </div>

                              )
                            )

                          )}

                        </div>

                        {notifications.length > 0 && (

                          <div className="notification-footer">

                            <button
                              type="button"
                              onClick={
                                markAllAsRead
                              }
                            >
                              <Check size={15} />
                              Mark all as read
                            </button>

                          </div>

                        )}

                      </div>

                    )}

                  </div>

                  {/* Profile */}

                  <div className="topbar-profile">

                    <div className="avatar">
                      P
                    </div>

                    <div>

                      <strong>
                        Pranjal Hon
                      </strong>

                      <span>
                        Student
                      </span>

                    </div>

                  </div>

                </div>

              </header>

              {/* =========================
                  APPLICATION ROUTES
              ========================== */}

              <Routes>

                <Route
                  path="/"
                  element={
                  <ProtectedRoute>
                  <Dashboard />
                  </ProtectedRoute>
                  }
                />

                <Route
                  path="/events"
                  element={<Events />}
                />

                <Route
                  path="/registrations"
                  element={<Registrations />}
                />

                <Route
                  path="/participants"
                  element={<Participants />}
                />

                <Route
                  path="/venues"
                  element={<Venues />}
                />

                <Route
                  path="/reports"
                  element={<Reports />}
                />

                <Route
                  path="/settings"
                  element={<SettingsPage />}
                />

                {/* Temporary placeholders for future roles */}

                <Route
                  path="/admin"
                  element={
                    <div style={{ padding: "30px" }}>
                      Admin dashboard coming next.
                    </div>
                  }
                />

                <Route
                  path="/student"
                  element={
                    <div style={{ padding: "30px" }}>
                      Student dashboard coming next.
                    </div>
                  }
                />

                <Route
                  path="*"
                  element={<Navigate to="/" replace />}
                />

              </Routes>

            </main>

          </div>
        }
      />

    </Routes>
  );
}

export default App;