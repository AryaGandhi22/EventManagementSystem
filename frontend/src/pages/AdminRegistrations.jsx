import { Search, UserRound, CalendarDays, TicketCheck, MoreVertical } from "lucide-react";
import { useState } from "react";

function AdminRegistrations() {
  const [search, setSearch] = useState("");

  const registrations = [
    {
      id: 1,
      participant: "Aarav Sharma",
      email: "aarav@college.com",
      event: "Tech Fest 2026",
      date: "12 Sep 2026",
      status: "Confirmed",
    },
    {
      id: 2,
      participant: "Sneha Patil",
      email: "sneha@college.com",
      event: "Cultural Night",
      date: "14 Sep 2026",
      status: "Confirmed",
    },
    {
      id: 3,
      participant: "Rahul Joshi",
      email: "rahul@college.com",
      event: "Sports Meet",
      date: "16 Sep 2026",
      status: "Pending",
    },
    {
      id: 4,
      participant: "Kavya More",
      email: "kavya@college.com",
      event: "AI Workshop",
      date: "18 Sep 2026",
      status: "Cancelled",
    },
    {
      id: 5,
      participant: "Rohan Deshmukh",
      email: "rohan@college.com",
      event: "Tech Fest 2026",
      date: "19 Sep 2026",
      status: "Confirmed",
    },
    {
      id: 6,
      participant: "Isha Kulkarni",
      email: "isha@college.com",
      event: "Cultural Night",
      date: "20 Sep 2026",
      status: "Confirmed",
    },
  ];

  const filteredRegistrations = registrations.filter((registration) =>
    `${registration.participant} ${registration.email} ${registration.event}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Registrations</h1>
          <p>Manage event registrations and participant status.</p>
        </div>
      </div>

      <div className="admin-content-card">
        <div className="admin-table-toolbar">
          <div className="admin-search-box">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search registrations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="admin-registration-count">
            {filteredRegistrations.length} registrations
          </div>
        </div>

        <div className="admin-registrations-grid">
          {filteredRegistrations.map((registration) => (
            <div className="admin-registration-card" key={registration.id}>
              <div className="admin-registration-top">
                <div className="admin-registration-user">
                  <div className="admin-registration-avatar">
                    <UserRound size={20} />
                  </div>

                  <div>
                    <strong>{registration.participant}</strong>
                    <span>{registration.email}</span>
                  </div>
                </div>

                <button className="admin-more-btn">
                  <MoreVertical size={18} />
                </button>
              </div>

              <div className="admin-registration-event">
                <TicketCheck size={18} />
                <span>{registration.event}</span>
              </div>

              <div className="admin-registration-date">
                <CalendarDays size={16} />
                <span>{registration.date}</span>
              </div>

              <div className="admin-registration-bottom">
                <span
                  className={`admin-registration-status ${registration.status.toLowerCase()}`}
                >
                  {registration.status}
                </span>

                <button className="admin-view-btn">
                  View
                </button>
              </div>
            </div>
          ))}

          {filteredRegistrations.length === 0 && (
            <div className="admin-empty-state">
              No registrations found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminRegistrations;