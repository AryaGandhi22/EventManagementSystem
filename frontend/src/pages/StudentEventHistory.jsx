import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  CheckCircle2,
  XCircle,
  UserX,
  AlertCircle,
  History,
} from "lucide-react";
import { getRegistrations } from "../api";

const StudentEventHistory = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getRegistrations();

      const data = Array.isArray(response)
        ? response
        : response?.results || [];

      setRegistrations(data);
    } catch (err) {
      console.error("Event history error:", err);
      setError("Unable to load your event history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const getEvent = (registration) =>
    registration.event_details ||
    registration.event ||
    {};

  const getEventTitle = (registration) => {
    const event = getEvent(registration);

    return (
      event.title ||
      registration.event_title ||
      "Untitled Event"
    );
  };

  const getEventDate = (registration) => {
    const event = getEvent(registration);

    const rawDate =
      event.end_date ||
      event.end_time ||
      event.start_date ||
      event.start_time ||
      event.date ||
      event.event_date;

    if (!rawDate) return null;

    const date = new Date(rawDate);

    return Number.isNaN(date.getTime())
      ? null
      : date;
  };

  const formatDate = (registration) => {
    const date = getEventDate(registration);

    if (!date) return "Date not specified";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (registration) => {
    const date = getEventDate(registration);

    if (!date) return "Time not specified";

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLocation = (registration) => {
    const event = getEvent(registration);

    return (
      event.venue?.name ||
      event.venue_name ||
      event.location ||
      "Venue not specified"
    );
  };

  const getCategory = (registration) => {
    const event = getEvent(registration);

    return event.category || "General";
  };

  /*
   * History statuses supported by the project:
   * checked-in
   * no-show
   * cancelled
   *
   * We also include registrations whose event date
   * has already passed.
   */
  const historyEvents = useMemo(() => {
    const now = new Date();

    return registrations.filter((registration) => {
      const status = registration.status;

      if (
        ["checked-in", "no-show", "cancelled"].includes(
          status
        )
      ) {
        return true;
      }

      const eventDate = getEventDate(registration);

      return eventDate && eventDate < now;
    });
  }, [registrations]);

  const attendedCount = historyEvents.filter(
    (registration) =>
      registration.status === "checked-in"
  ).length;

  const noShowCount = historyEvents.filter(
    (registration) =>
      registration.status === "no-show"
  ).length;

  const cancelledCount = historyEvents.filter(
    (registration) =>
      registration.status === "cancelled"
  ).length;

  const getStatusIcon = (status) => {
    if (status === "checked-in") {
      return <CheckCircle2 size={16} />;
    }

    if (status === "no-show") {
      return <UserX size={16} />;
    }

    if (status === "cancelled") {
      return <XCircle size={16} />;
    }

    return <History size={16} />;
  };

  const getStatusLabel = (status) => {
    if (status === "checked-in") {
      return "Attended";
    }

    if (status === "no-show") {
      return "No Show";
    }

    if (status === "cancelled") {
      return "Cancelled";
    }

    return "Completed";
  };

  return (
    <section className="student-history-page">

      {/* HEADER */}
      <div className="student-page-heading">
        <div>
          <div className="student-welcome">
            EVENT HISTORY
          </div>

          <h1>Event History</h1>

          <p>
            Review your previous events, attendance,
            and registration history.
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="student-registration-error">
          <AlertCircle size={16} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {/* SUMMARY */}
      <div className="student-stats-grid">

        <div className="student-stat-card">
          <div className="student-stat-top">
            <div className="student-stat-icon blue">
              <History size={21} />
            </div>
          </div>

          <h3>
            {loading ? "--" : historyEvents.length}
          </h3>

          <p>Past Events</p>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-top">
            <div className="student-stat-icon green">
              <CheckCircle2 size={21} />
            </div>
          </div>

          <h3>
            {loading ? "--" : attendedCount}
          </h3>

          <p>Events Attended</p>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-top">
            <div className="student-stat-icon orange">
              <UserX size={21} />
            </div>
          </div>

          <h3>
            {loading ? "--" : noShowCount}
          </h3>

          <p>No Shows</p>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-top">
            <div className="student-stat-icon purple">
              <XCircle size={21} />
            </div>
          </div>

          <h3>
            {loading ? "--" : cancelledCount}
          </h3>

          <p>Cancelled</p>
        </div>

      </div>

      {/* HISTORY TABLE */}
      <div className="student-card">

        <div className="student-section-header">
          <div>
            <h2>Previous Events</h2>
            <p>
              Your event participation history.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="student-empty-state">
            <Clock3 size={28} />

            <h3>Loading event history...</h3>

            <p>
              Please wait while we fetch your
              previous events.
            </p>
          </div>
        ) : historyEvents.length === 0 ? (
          <div className="student-empty-state">
            <History size={30} />

            <h3>No event history yet</h3>

            <p>
              Events that you attend or complete will
              appear here.
            </p>
          </div>
        ) : (
          <div className="student-history-table-wrapper">

            <table className="student-history-table">

              <thead>
                <tr>
                  <th>Event</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {historyEvents.map(
                  (registration) => {
                    const status =
                      registration.status ||
                      "completed";

                    return (
                      <tr key={registration.id}>

                        <td>
                          <div className="student-history-event">
                            <div className="student-history-event-icon">
                              <CalendarDays
                                size={18}
                              />
                            </div>

                            <div>
                              <strong>
                                {getEventTitle(
                                  registration
                                )}
                              </strong>

                              <span>
                                {formatTime(
                                  registration
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="student-history-category">
                            {getCategory(
                              registration
                            )}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            registration
                          )}
                        </td>

                        <td>
                          <span className="student-history-location">
                            <MapPin size={14} />
                            {getLocation(
                              registration
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`student-history-status ${status}`}
                          >
                            {getStatusIcon(status)}

                            {getStatusLabel(
                              status
                            )}
                          </span>
                        </td>

                      </tr>
                    );
                  }
                )}
              </tbody>

            </table>

          </div>
        )}

      </div>

    </section>
  );
};

export default StudentEventHistory;