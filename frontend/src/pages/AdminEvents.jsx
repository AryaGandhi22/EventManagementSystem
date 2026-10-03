import {
  Search,
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  MoreVertical,
} from "lucide-react";

function AdminEvents() {
  const events = [
    {
      title: "Tech Fest 2026",
      category: "Technical",
      organizer: "Sneha Patil",
      date: "18 Oct 2026",
      registrations: "86 / 100",
      status: "Approved",
    },
    {
      title: "Cultural Night",
      category: "Cultural",
      organizer: "Rahul Joshi",
      date: "24 Oct 2026",
      registrations: "142 / 150",
      status: "Approved",
    },
    {
      title: "Sports Meet",
      category: "Sports",
      organizer: "Aarav Sharma",
      date: "02 Nov 2026",
      registrations: "64 / 120",
      status: "Approved",
    },
    {
      title: "AI Workshop",
      category: "Technical",
      organizer: "Sneha Patil",
      date: "10 Nov 2026",
      registrations: "0 / 80",
      status: "Pending",
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <h1>Event Management</h1>
          <p className="page-description">
            Manage and monitor all events in the system.
          </p>
        </div>
      </div>

      <div className="admin-user-toolbar">
        <div className="admin-user-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search events..."
          />
        </div>
      </div>

      <div className="admin-table-panel">
        <div className="admin-table-header">
          <div>
            <h2>All Events</h2>
            <p>
              View event details, registrations and approval status.
            </p>
          </div>
        </div>

        <div className="admin-events-table">
          <div className="admin-events-heading">
            <span>Event</span>
            <span>Organizer</span>
            <span>Date</span>
            <span>Registrations</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {events.map((event) => (
            <div
              className="admin-events-row"
              key={event.title}
            >
              <div className="admin-event-info">
                <div className="admin-event-icon">
                  <CalendarDays size={18} />
                </div>

                <div>
                  <strong>{event.title}</strong>
                  <span>{event.category}</span>
                </div>
              </div>

              <span className="admin-role">
                {event.organizer}
              </span>

              <span className="admin-event-date">
                {event.date}
              </span>

              <span className="admin-registration-count">
                {event.registrations}
              </span>

              <span
                className={`admin-event-status ${
                  event.status === "Pending"
                    ? "warning"
                    : ""
                }`}
              >
                {event.status === "Approved" ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <Clock size={14} />
                )}
                {event.status}
              </span>

              <div className="admin-user-actions">
                <button
                  type="button"
                  title="More options"
                >
                  <MoreVertical size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminEvents;