import { useEffect, useState } from "react";
import {
  Search,
  UserRound,
  CalendarDays,
  TicketCheck,
  MoreVertical,
  X,
  Eye,
  Ban,
} from "lucide-react";
import { getRegistrations, cancelRegistration } from "../api";

function AdminRegistrations() {
  const [search, setSearch] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const loadRegistrations = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getRegistrations({ all: "1" });
      setRegistrations(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load registrations.");
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const filteredRegistrations = registrations.filter((registration) => {
    const participant =
      registration.user?.name ||
      registration.user?.username ||
      "";

    const email = registration.user?.email || "";

    const event =
      registration.event_details?.title ||
      "";

    return `${participant} ${email} ${event}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusLabel = (status) => {
    if (status === "registered") return "Confirmed";
    if (status === "waitlisted") return "Pending";
    if (status === "cancelled") return "Cancelled";

    return status || "Unknown";
  };

  const getStatusClass = (status) => {
    if (status === "registered") return "confirmed";
    if (status === "waitlisted") return "pending";
    if (status === "cancelled") return "cancelled";

    return "";
  };

  const handleView = (registration) => {
    setOpenMenu(null);
    setSelectedRegistration(registration);
  };

  const handleCancel = async (registration) => {
    setOpenMenu(null);

    if (registration.status === "cancelled") {
      return;
    }

    try {
      await cancelRegistration(registration.id);
      await loadRegistrations();
    } catch (e) {
      window.alert(
        e.message || "Failed to cancel the registration."
      );
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Registrations</h1>
          <p>Manage event registrations and participant status.</p>
        </div>
      </div>

      <div className="admin-table-toolbar">
        <div className="admin-search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search registrations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <span className="admin-registration-count">
          {filteredRegistrations.length} registrations
        </span>
      </div>

      {loading && (
        <div className="admin-empty-state">
          Loading registrations...
        </div>
      )}

      {!loading && error && (
        <div className="admin-empty-state">
          {error}
        </div>
      )}

      {!loading && !error && filteredRegistrations.length === 0 && (
        <div className="admin-empty-state">
          No registrations found.
        </div>
      )}

      {!loading && !error && filteredRegistrations.length > 0 && (
        <div className="admin-registrations-grid">
          {filteredRegistrations.map((registration) => {
            const participant =
              registration.user?.name ||
              registration.user?.username ||
              "Unknown User";

            const email =
              registration.user?.email ||
              "No email";

            const eventTitle =
              registration.event_details?.title ||
              "Unknown Event";

            return (
              <div
                className="admin-registration-card"
                key={registration.id}
              >
                <div className="admin-registration-top">
                  <div className="admin-registration-user">
                    <div className="admin-registration-avatar">
                      <UserRound size={20} />
                    </div>

                    <div>
                      <strong>{participant}</strong>
                      <span>{email}</span>
                    </div>
                  </div>

                  <div className="admin-registration-actions">
                    <button
                      className="admin-more-btn"
                      type="button"
                      aria-label="More options"
                      onClick={() =>
                        setOpenMenu(
                          openMenu === registration.id
                            ? null
                            : registration.id
                        )
                      }
                    >
                      <MoreVertical size={20} />
                    </button>

                    {openMenu === registration.id && (
                      <div className="admin-action-menu">
                        {registration.status !== "cancelled" && (
                          <button
                            type="button"
                            className="danger"
                            onClick={() =>
                              handleCancel(registration)
                            }
                          >
                            <Ban size={16} />
                            Cancel registration
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="admin-registration-event">
                    <TicketCheck size={20} />
                    <strong>{eventTitle}</strong>
                  </div>

                  <div className="admin-registration-date">
                    <CalendarDays size={18} />
                    <span>
                      {formatDate(registration.registered_at)}
                    </span>
                  </div>
                </div>

                <div className="admin-registration-bottom">
                  <span
                    className={`admin-registration-status ${getStatusClass(
                      registration.status
                    )}`}
                  >
                    {getStatusLabel(registration.status)}
                  </span>

                  <button
                    className="admin-view-btn"
                    type="button"
                    onClick={() => handleView(registration)}
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Registration Details Modal */}
      {selectedRegistration && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedRegistration(null)}
        >
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h2>Registration Details</h2>
                <p>View participant registration information.</p>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedRegistration(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-detail-row">
                <span>Participant</span>
                <strong>
                  {selectedRegistration.user?.name ||
                    selectedRegistration.user?.username ||
                    "Unknown User"}
                </strong>
              </div>

              <div className="admin-detail-row">
                <span>Email</span>
                <strong>
                  {selectedRegistration.user?.email ||
                    "No email"}
                </strong>
              </div>

              <div className="admin-detail-row">
                <span>Event</span>
                <strong>
                  {selectedRegistration.event_details?.title ||
                    "Unknown Event"}
                </strong>
              </div>

              <div className="admin-detail-row">
                <span>Registration date</span>
                <strong>
                  {formatDate(
                    selectedRegistration.registered_at
                  )}
                </strong>
              </div>

              <div className="admin-detail-row">
                <span>Status</span>
                <span
                  className={`admin-registration-status ${getStatusClass(
                    selectedRegistration.status
                  )}`}
                >
                  {getStatusLabel(
                    selectedRegistration.status
                  )}
                </span>
              </div>

              <div className="admin-detail-row">
                <span>Check-in</span>
                <strong>
                  {selectedRegistration.checked_in
                    ? "Checked in"
                    : "Not checked in"}
                </strong>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-view-btn"
                onClick={() => setSelectedRegistration(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRegistrations;