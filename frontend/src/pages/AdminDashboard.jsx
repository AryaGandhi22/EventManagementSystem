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

function AdminDashboard() {
  const stats = [
    {
      label: "Total Users",
      value: "248",
      change: "+12 this month",
      icon: Users,
    },
    {
      label: "Total Events",
      value: "24",
      change: "+4 this month",
      icon: CalendarDays,
    },
    {
      label: "Total Venues",
      value: "12",
      change: "+2 this month",
      icon: MapPin,
    },
    {
      label: "Registrations",
      value: "1,284",
      change: "+18% this month",
      icon: ClipboardList,
    },
  ];

  const recentUsers = [
    {
      name: "Aarav Sharma",
      email: "aarav@college.com",
      role: "Student",
      status: "Active",
    },
    {
      name: "Sneha Patil",
      email: "sneha@college.com",
      role: "Organizer",
      status: "Active",
    },
    {
      name: "Rahul Joshi",
      email: "rahul@college.com",
      role: "Student",
      status: "Active",
    },
    {
      name: "Kavya More",
      email: "kavya@college.com",
      role: "Student",
      status: "Inactive",
    },
  ];

  const recentEvents = [
    {
      title: "Tech Fest 2026",
      category: "Technical",
      date: "18 Oct 2026",
      registrations: "86 / 100",
      status: "Open",
    },
    {
      title: "Cultural Night",
      category: "Cultural",
      date: "24 Oct 2026",
      registrations: "142 / 150",
      status: "Almost Full",
    },
    {
      title: "Sports Meet",
      category: "Sports",
      date: "02 Nov 2026",
      registrations: "64 / 120",
      status: "Open",
    },
  ];

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

      {/* Statistics */}
      <div className="admin-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="admin-stat-card" key={stat.label}>
              <div className="admin-stat-top">
                <div className="admin-stat-icon">
                  <Icon size={20} />
                </div>

                <ArrowUpRight size={17} />
              </div>

              <div className="admin-stat-value">
                {stat.value}
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

        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>User Management</h2>
              <p>Manage registered users and organizers.</p>
            </div>

            <Users size={21} />
          </div>

          <div className="admin-management-row">
            <div className="admin-management-icon">
              <UserCheck size={18} />
            </div>

            <div>
              <strong>236 Active Users</strong>
              <span>Users currently active</span>
            </div>
          </div>

          <div className="admin-management-row">
            <div className="admin-management-icon">
              <UserX size={18} />
            </div>

            <div>
              <strong>12 Inactive Users</strong>
              <span>Accounts currently inactive</span>
            </div>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Event Management</h2>
              <p>Monitor events and registrations.</p>
            </div>

            <CalendarDays size={21} />
          </div>

          <div className="admin-management-row">
            <div className="admin-management-icon">
              <CheckCircle2 size={18} />
            </div>

            <div>
              <strong>18 Upcoming Events</strong>
              <span>Currently scheduled events</span>
            </div>
          </div>

          <div className="admin-management-row">
            <div className="admin-management-icon">
              <Clock size={18} />
            </div>

            <div>
              <strong>6 Pending Events</strong>
              <span>Waiting for approval</span>
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
              <p>Recently registered users.</p>
            </div>

            <button type="button" className="admin-view-button">
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

            {recentUsers.map((user) => (
              <div
                className="admin-table-row"
                key={user.email}
              >
                <div className="admin-user-cell">
                  <div className="admin-user-avatar">
                    {user.name.charAt(0)}
                  </div>

                  <div>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                </div>

                <span className="admin-role">
                  {user.role}
                </span>

                <span
                  className={`admin-status ${
                    user.status === "Active"
                      ? "active"
                      : "inactive"
                  }`}
                >
                  {user.status}
                </span>
              </div>
            ))}

          </div>
        </div>

        {/* Recent Events */}
        <div className="admin-table-panel">

          <div className="admin-table-header">
            <div>
              <h2>Recent Events</h2>
              <p>Latest events in the system.</p>
            </div>

            <button type="button" className="admin-view-button">
              View All
              <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="admin-event-list">

            {recentEvents.map((event) => (
              <div
                className="admin-event-row"
                key={event.title}
              >
                <div className="admin-event-info">

                  <div className="admin-event-icon">
                    <CalendarDays size={18} />
                  </div>

                  <div>
                    <strong>{event.title}</strong>

                    <span>
                      {event.category} · {event.date}
                    </span>
                  </div>

                </div>

                <div className="admin-event-meta">
                  <strong>
                    {event.registrations}
                  </strong>

                  <span
                    className={`admin-event-status ${
                      event.status === "Almost Full"
                        ? "warning"
                        : ""
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;