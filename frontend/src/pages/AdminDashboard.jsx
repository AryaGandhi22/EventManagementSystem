import { useEffect, useState } from "react";

import {
  Users,
  CalendarDays,
  MapPin,
  ClipboardList,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

import { getDashboard } from "../api";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const data = await getDashboard();

        if (mounted) {
          setDashboard(data);
        }
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);

        if (mounted) {
          setError(
            err?.message || "Failed to load dashboard data."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const statistics = dashboard?.statistics || {};

  const formatNumber = (value) => {
    if (value === undefined || value === null) {
      return "—";
    }

    return Number(value).toLocaleString();
  };

  const stats = [
    {
      label: "Total Users",
      value: formatNumber(statistics.total_users),
      change: "Registered users",
      icon: Users,
    },
    {
      label: "Total Events",
      value: formatNumber(statistics.total_events),
      change: "Events in system",
      icon: CalendarDays,
    },
    {
      label: "Total Venues",
      value: formatNumber(statistics.total_venues),
      change: "Venues in system",
      icon: MapPin,
    },
    {
      label: "Registrations",
      value: formatNumber(statistics.total_registrations),
      change: "Total registrations",
      icon: ClipboardList,
    },
  ];

  const upcomingEvents = dashboard?.upcoming_events || [];

  const recentEvents = upcomingEvents
    .slice(0, 3)
    .map((event) => {
      const startDate = event.start_date
        ? new Date(event.start_date)
        : null;

      const formattedDate =
        startDate && !Number.isNaN(startDate.getTime())
          ? startDate.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "Date unavailable";

      return {
        id: event.id || event._id || event.pk || event.title,
        title: event.title || "Untitled Event",
        category: event.category || "Event",
        date: formattedDate,
        registrations: event.registration_count
          ? `${event.registration_count} registrations`
          : "Upcoming",
        status: "Upcoming",
      };
    });

  return (
    <div className="admin-dashboard">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>

          <p className="page-description">
            Manage users, events, venues and system activity.
          </p>
        </div>

        <div className="admin-date">
          <Clock size={16} />
          <span>System Overview</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "#fff1f2",
            color: "#be123c",
            border: "1px solid #fecdd3",
          }}
        >
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="admin-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              className="admin-stat-card"
              key={stat.label}
            >
              <div className="admin-stat-top">
                <div className="admin-stat-icon">
                  <Icon size={20} />
                </div>

                <ArrowUpRight size={17} />
              </div>

              <div className="admin-stat-value">
                {loading ? "..." : stat.value}
              </div>

              <div className="admin-stat-label">
                {stat.label}
              </div>

              <div className="admin-stat-change">
                {stat.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Management cards */}
      <div className="admin-management-grid">

        {/* User Management */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>User Management</h2>

              <p>
                Manage registered users and organizers.
              </p>
            </div>

            <Users size={21} />
          </div>

          <div className="admin-management-row">
            <div className="admin-management-icon">
              <UserCheck size={18} />
            </div>

            <div>
              <strong>
                {loading
                  ? "..."
                  : `${formatNumber(
                      statistics.total_users
                    )} Total Users`}
              </strong>

              <span>
                Users currently registered
              </span>
            </div>
          </div>

          <div className="admin-management-row">
            <div className="admin-management-icon">
              <UserX size={18} />
            </div>

            <div>
              <strong>
                {loading
                  ? "..."
                  : `${formatNumber(
                      statistics.active_venues
                    )} Active Venues`}
              </strong>

              <span>
                Venues currently available
              </span>
            </div>
          </div>
        </div>

        {/* Event Management */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Event Management</h2>

              <p>
                Monitor events and registrations.
              </p>
            </div>

            <CalendarDays size={21} />
          </div>

          <div className="admin-management-row">
            <div className="admin-management-icon">
              <CheckCircle2 size={18} />
            </div>

            <div>
              <strong>
                {loading
                  ? "..."
                  : `${formatNumber(
                      statistics.upcoming_events
                    )} Upcoming Events`}
              </strong>

              <span>
                Currently scheduled events
              </span>
            </div>
          </div>


        </div>

      </div>

      {/* Bottom section */}
      <div className="admin-content-grid">

        {/* Recent Users */}
        <div className="admin-table-panel">

          <div className="admin-table-header">
            <div>
              <h2>Recent Users</h2>

              <p>
                User information will be connected next.
              </p>
            </div>

            <button
              type="button"
              className="admin-view-button"
            >
              View All
              <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="admin-table">

            <div className="admin-table-row admin-table-heading">
              <span>User</span>
              <span>Role</span>
              <span>Status</span>
            </div>

            <div className="admin-table-row">
              <div className="admin-user-cell">
                <div className="admin-user-avatar">
                  U
                </div>

                <div>
                  <strong>
                    {loading
                      ? "Loading..."
                      : `${formatNumber(
                          statistics.total_users
                        )} users`}
                  </strong>

                  <span>
                    Total registered accounts
                  </span>
                </div>
              </div>

              <span className="admin-role">
                Users
              </span>

              <span className="admin-status active">
                Active
              </span>
            </div>

          </div>
        </div>

        {/* Recent Events */}
        <div className="admin-table-panel">

          <div className="admin-table-header">
            <div>
              <h2>Recent Events</h2>

              <p>
                Upcoming events from the system.
              </p>
            </div>

            <button
              type="button"
              className="admin-view-button"
            >
              View All
              <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="admin-event-list">

            {loading ? (
              <div className="admin-event-row">
                <div className="admin-event-info">
                  <div className="admin-event-icon">
                    <CalendarDays size={18} />
                  </div>

                  <div>
                    <strong>
                      Loading events...
                    </strong>

                    <span>
                      Please wait
                    </span>
                  </div>
                </div>
              </div>
            ) : recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <div
                  className="admin-event-row"
                  key={event.id}
                >
                  <div className="admin-event-info">

                    <div className="admin-event-icon">
                      <CalendarDays size={18} />
                    </div>

                    <div>
                      <strong>
                        {event.title}
                      </strong>

                      <span>
                        {event.category} · {event.date}
                      </span>
                    </div>

                  </div>

                  <div className="admin-event-meta">

                    <strong>
                      {event.registrations}
                    </strong>

                    <span className="admin-event-status">
                      {event.status}
                    </span>

                  </div>
                </div>
              ))
            ) : (
              <div className="admin-event-row">
                <div className="admin-event-info">

                  <div className="admin-event-icon">
                    <CalendarDays size={18} />
                  </div>

                  <div>
                    <strong>
                      No upcoming events
                    </strong>

                    <span>
                      No events are currently scheduled.
                    </span>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;