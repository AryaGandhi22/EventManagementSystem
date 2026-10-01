import { useEffect, useState } from "react";
import { NavLink, Routes, Route, useLocation, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Registrations from "./pages/Registrations";
import Participants from "./pages/Participants";
import Venues from "./pages/Venues";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/Settings";
import { getMe } from "./api";
import { errorMessage, initials } from "./utils";

function App() {
  const [user, setUser] = useState(null);
  const [bootError, setBootError] = useState("");
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

const [notifications, setNotifications] = useState([
  {
    id: 1,
    title: "New event registration",
    message: "A student registered for an event.",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: 2,
    title: "Event updated",
    message: "College Tech Fest was updated.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    title: "Venue available",
    message: "Auditorium Hall is now available.",
    time: "2 hours ago",
    read: true,
  },
]);
const unreadCount = notifications.filter(
  (notification) => !notification.read
).length;

const markNotificationAsRead = (id) => {
  setNotifications((current) =>
    current.map((notification) =>
      notification.id === id
        ? { ...notification, read: true }
        : notification
    )
  );
};

const markAllNotificationsAsRead = () => {
  setNotifications((current) =>
    current.map((notification) => ({
      ...notification,
      read: true,
    }))
  );
};
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch((error) => setBootError(errorMessage(error)));
  }, []);

  const name = user?.name || user?.username || "Demo Administrator";
  const avatar = initials(name);

  const onSearch = (event) => {
    if (event.key === "Enter") {
      const value = search.trim();
      navigate(value ? `/events?search=${encodeURIComponent(value)}` : "/events");
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo-icon">E</div>
          <div>
            <h2>EventHub</h2>
            <p>College Events</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="menu-title">MAIN MENU</p>
          <NavLink to="/" end className="nav-item"><LayoutDashboard size={19} /><span>Dashboard</span></NavLink>
          <NavLink to="/events" className="nav-item"><CalendarDays size={19} /><span>Events</span></NavLink>
          <NavLink to="/registrations" className="nav-item"><ClipboardList size={19} /><span>My Registrations</span></NavLink>
          <NavLink to="/participants" className="nav-item"><Users size={19} /><span>Participants</span></NavLink>
          <NavLink to="/venues" className="nav-item"><MapPin size={19} /><span>Venues</span></NavLink>
          <p className="menu-title management-title">MANAGEMENT</p>
          <NavLink to="/reports" className="nav-item"><BarChart3 size={19} /><span>Reports</span></NavLink>
          <NavLink to="/settings" className="nav-item"><Settings size={19} /><span>Settings</span></NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-mini">
            <div className="avatar">{avatar}</div>
            <div className="profile-info">
              <strong>{name}</strong>
              <span>{user?.username === "demo_admin" ? "Event Administrator" : "Student"}</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={onSearch}
            />
          </div>

          <div className="topbar-actions">
            <button className="icon-button" type="button" title="Notifications">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>
            <div className="topbar-profile">
              <div className="avatar">{avatar}</div>
              <div>
                <strong>{name}</strong>
                <span>{user?.username === "demo_admin" ? "Event Administrator" : "Student"}</span>
              </div>
            </div>
          </div>
        </header>

        {bootError && location.pathname !== "/settings" ? (
          <div style={{ margin: "18px 30px", padding: "12px 16px", borderRadius: 10, background: "#fff1f2", color: "#b42318" }}>
            Backend connection error: {bootError}
          </div>
        ) : null}

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/registrations" element={<Registrations />} />
          <Route path="/participants" element={<Participants />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
