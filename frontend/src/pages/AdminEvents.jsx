
import { useEffect, useState } from "react";

import {
  Search,
  CalendarDays,
  CheckCircle2,
  Clock,
  MoreVertical,
  Eye,
  X,
} from "lucide-react";

import { api, updateEventStatus } from "../api";

function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openMenu, setOpenMenu] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const loadEvents = async (searchValue = "") => {
    setLoading(true);
    setError("");

    try {
      const query = searchValue
        ? `?search=${encodeURIComponent(searchValue)}`
        : "";

      const data = await api(`/admin/events/${query}`);

      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load events:", e);

      setError(
        e?.data?.detail ||
          e?.message ||
          "Unable to load events."
      );

      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;

    setSearch(value);
    loadEvents(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "—";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) {
      return "—";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    if (status === "Completed") {
      return <CheckCircle2 size={14} />;
    }

    if (status === "Ongoing") {
      return <Clock size={14} />;
    }

    return <Clock size={14} />;
  };

  const getStatusClass = (status) => {
    if (status === "Completed") {
      return "";
    }

    if (status === "Ongoing") {
      return "warning";
    }

    return "";
  };

  const handleMenuClick = (eventId) => {
    setOpenMenu((current) =>
      current === eventId ? null : eventId
    );
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setOpenMenu(null);
  };

  const handleStatusChange = async (eventId, newStatus) => {
    setOpenMenu(null);
    try {
      await updateEventStatus(eventId, newStatus);
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventId ? { ...ev, status: newStatus } : ev
        )
      );
    } catch (e) {
      alert(e?.data?.detail || "Failed to update status");
    }
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div
      className="admin-dashboard"
      onClick={() => setOpenMenu(null)}
    >
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
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="admin-table-panel">
        <div className="admin-table-header">
          <div>
            <h2>All Events</h2>

            <p>
              View event details, registrations and event status.
            </p>
          </div>
        </div>

        {error && (
          <div className="admin-error-message">
            {error}
          </div>
        )}

        <div className="admin-events-table">
          <div className="admin-events-heading">
            <span>Event</span>
            <span>Organizer</span>
            <span>Date</span>
            <span>Registrations</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div className="admin-users-empty">
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="admin-users-empty">
              No events found.
            </div>
          ) : (
            events.map((event) => (
              <div
                className="admin-events-row"
                key={event.id || event.title}
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
                      {event.category}
                    </span>
                  </div>
                </div>

                <span className="admin-role">
                  {event.organizer || "—"}
                </span>

                <span className="admin-event-date">
                  {formatDate(event.start_date)}
                </span>

                <span className="admin-registration-count">
                  {event.registrations ?? 0} /{" "}
                  {event.capacity ?? 0}
                </span>

                <span
                  className={`admin-event-status ${getStatusClass(
                    event.status
                  )}`}
                >
                  {getStatusIcon(event.status)}

                  {event.status || "Upcoming"}
                </span>

                <div
                  className="admin-user-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="admin-user-menu-wrapper">
                    <button
                      type="button"
                      title="More options"
                      onClick={() =>
                        handleMenuClick(event.id)
                      }
                    >
                      <MoreVertical size={17} />
                    </button>

                    {openMenu === event.id && (
                      <div className="admin-user-dropdown">
                        <button
                          type="button"
                          onClick={() =>
                            handleViewDetails(event)
                          }
                        >
                          <Eye size={16} />
                          <span>View Details</span>
                        </button>
                        {event.status !== "published" && event.status !== "completed" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(event.id, "published")
                            }
                          >
                            <CheckCircle2 size={16} />
                            <span>Publish</span>
                          </button>
                        )}
                        {event.status !== "completed" && event.status !== "cancelled" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(event.id, "completed")
                            }
                          >
                            <CheckCircle2 size={16} />
                            <span>Mark Completed</span>
                          </button>
                        )}
                        {event.status !== "cancelled" && event.status !== "completed" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(event.id, "cancelled")
                            }
                          >
                            <X size={16} />
                            <span>Cancel Event</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <div
          className="admin-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="admin-user-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="admin-modal-header">
              <div>
                <h2>Event Details</h2>

                <p>
                  View complete event information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="admin-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-user-details">
              <div className="admin-detail-avatar">
                <CalendarDays size={24} />
              </div>

              <div className="admin-detail-item">
                <label>Event</label>
                <strong>
                  {selectedEvent.title || "—"}
                </strong>
              </div>

              <div className="admin-detail-item">
                <label>Category</label>
                <strong>
                  {selectedEvent.category || "—"}
                </strong>
              </div>

              <div className="admin-detail-item">
                <label>Organizer</label>
                <strong>
                  {selectedEvent.organizer || "—"}
                </strong>
              </div>

              <div className="admin-detail-item">
                <label>Venue</label>
                <strong>
                  {selectedEvent.venue || "—"}
                </strong>
              </div>

              <div className="admin-detail-item">
                <label>Start</label>
                <strong>
                  {formatDateTime(
                    selectedEvent.start_date
                  )}
                </strong>
              </div>

              <div className="admin-detail-item">
                <label>End</label>
                <strong>
                  {formatDateTime(
                    selectedEvent.end_date
                  )}
                </strong>
              </div>

              <div className="admin-detail-item">
                <label>Registrations</label>
                <strong>
                  {selectedEvent.registrations ?? 0} /{" "}
                  {selectedEvent.capacity ?? 0}
                </strong>
              </div>

              <div className="admin-detail-item">
                <label>Status</label>
                <strong>
                  {selectedEvent.status ||
                    "Upcoming"}
                </strong>
              </div>

              <div className="admin-detail-item">
                <label>Description</label>
                <strong>
                  {selectedEvent.description ||
                    "No description available."}
                </strong>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={closeModal}
                className="admin-modal-cancel"
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

export default AdminEvents;
