import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  X,
  CheckCircle2,
  AlertCircle,
  Ban,
} from "lucide-react";
import { getRegistrations, cancelRegistration } from "../api";
import { QRCodeSVG } from "qrcode.react";

const StudentMyEvents = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("upcoming");

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const [message, setMessage] = useState("");

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getRegistrations();

      const data = Array.isArray(response)
        ? response
        : response?.results || [];

      setRegistrations(data);
    } catch (err) {
      console.error("My Events error:", err);
      setError("Unable to load your registrations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
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
      event.start_date ||
      event.start_time ||
      event.start ||
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

  const getStatus = (registration) =>
    registration.status || "registered";

  const upcomingEvents = useMemo(
    () =>
      registrations.filter((registration) =>
        ["registered", "waitlisted"].includes(
          getStatus(registration)
        )
      ),
    [registrations]
  );

  const cancelledEvents = useMemo(
    () =>
      registrations.filter(
        (registration) =>
          getStatus(registration) === "cancelled"
      ),
    [registrations]
  );

  const completedEvents = useMemo(
    () =>
      registrations.filter((registration) =>
        ["checked-in", "no-show"].includes(
          getStatus(registration)
        )
      ),
    [registrations]
  );

  const visibleEvents =
    activeTab === "upcoming"
      ? upcomingEvents
      : activeTab === "completed"
      ? completedEvents
      : cancelledEvents;

  const handleCancel = async () => {
    if (!cancelTarget) return;

    try {
      setCancelling(true);
      setMessage("");

      await cancelRegistration(cancelTarget.id);

      setCancelTarget(null);
      setMessage("Registration cancelled successfully.");

      await loadRegistrations();
    } catch (err) {
      console.error("Cancellation error:", err);

      setError(
        err?.data?.detail ||
          "Unable to cancel this registration."
      );
    } finally {
      setCancelling(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === "registered") {
      return <CheckCircle2 size={15} />;
    }

    if (status === "waitlisted") {
      return <Clock3 size={15} />;
    }

    if (status === "cancelled") {
      return <Ban size={15} />;
    }

    return <CheckCircle2 size={15} />;
  };

  return (
    <section className="student-my-events">

      {/* HEADER */}
      <div className="student-page-heading">
        <div>
          <div className="student-welcome">
            MY EVENTS
          </div>

          <h1>My Events</h1>

          <p>
            Manage your event registrations and
            keep track of your campus activities.
          </p>
        </div>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className="student-registration-success">
          {message}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="student-registration-error">
          <AlertCircle size={16} />
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* SUMMARY */}
      <div className="student-stats-grid">

        <div className="student-stat-card">
          <div className="student-stat-top">
            <div className="student-stat-icon blue">
              <CalendarDays size={21} />
            </div>
          </div>

          <h3>{upcomingEvents.length}</h3>
          <p>Upcoming</p>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-top">
            <div className="student-stat-icon green">
              <CheckCircle2 size={21} />
            </div>
          </div>

          <h3>
            {
              registrations.filter(
                (registration) =>
                  getStatus(registration) ===
                  "registered"
              ).length
            }
          </h3>

          <p>Registered</p>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-top">
            <div className="student-stat-icon orange">
              <Clock3 size={21} />
            </div>
          </div>

          <h3>
            {
              registrations.filter(
                (registration) =>
                  getStatus(registration) ===
                  "waitlisted"
              ).length
            }
          </h3>

          <p>Waitlisted</p>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-top">
            <div className="student-stat-icon purple">
              <CheckCircle2 size={21} />
            </div>
          </div>

          <h3>{completedEvents.length}</h3>
          <p>Completed</p>
        </div>

      </div>

      {/* TABS */}
      <div className="student-card">

        <div className="student-section-header">
          <div>
            <h2>Your Registrations</h2>
            <p>
              View and manage your event registrations.
            </p>
          </div>

          <div className="student-tabs">

            <button
              type="button"
              className={
                activeTab === "upcoming"
                  ? "student-tab active"
                  : "student-tab"
              }
              onClick={() =>
                setActiveTab("upcoming")
              }
            >
              Upcoming
              <span>{upcomingEvents.length}</span>
            </button>

            <button
              type="button"
              className={
                activeTab === "completed"
                  ? "student-tab active"
                  : "student-tab"
              }
              onClick={() =>
                setActiveTab("completed")
              }
            >
              Completed
              <span>{completedEvents.length}</span>
            </button>

            <button
              type="button"
              className={
                activeTab === "cancelled"
                  ? "student-tab active"
                  : "student-tab"
              }
              onClick={() =>
                setActiveTab("cancelled")
              }
            >
              Cancelled
              <span>{cancelledEvents.length}</span>
            </button>

          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="student-empty-state">
            <Clock3 size={28} />
            <h3>Loading your events...</h3>
            <p>
              Please wait while we fetch your
              registrations.
            </p>
          </div>
        ) : visibleEvents.length === 0 ? (
          <div className="student-empty-state">
            <CalendarDays size={30} />

            <h3>
              {activeTab === "upcoming"
                ? "No upcoming events"
                : activeTab === "completed"
                ? "No completed events"
                : "No cancelled registrations"}
            </h3>

            <p>
              {activeTab === "upcoming"
                ? "Browse events and register for something you are interested in."
                : activeTab === "completed"
                ? "Your completed event history will appear here."
                : "Cancelled registrations will appear here."}
            </p>
          </div>
        ) : (
          <div className="student-my-event-list">

            {visibleEvents.map((registration) => {
              const status =
                getStatus(registration);

              return (
                <div
                  className="student-my-event-card"
                  key={registration.id}
                >

                  <div className="student-my-event-top">

                    <div>
                      <h3>
                        {getEventTitle(
                          registration
                        )}
                      </h3>

                      <div className="student-my-event-meta">

                        <span>
                          <CalendarDays
                            size={14}
                          />
                          {formatDate(
                            registration
                          )}
                        </span>

                        <span>
                          <Clock3 size={14} />
                          {formatTime(
                            registration
                          )}
                        </span>

                        <span>
                          <MapPin size={14} />
                          {getLocation(
                            registration
                          )}
                        </span>

                      </div>
                    </div>

                    <span
                      className={`student-status ${status}`}
                    >
                      {getStatusIcon(status)}

                      {status
                        .replace("-", " ")
                        .replace(
                          /\b\w/g,
                          (letter) =>
                            letter.toUpperCase()
                        )}
                    </span>

                  </div>

                  <div className="student-my-event-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                    {status === "registered" && (
                      <>
                        <div className="student-qr-code-section" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <QRCodeSVG 
                            value={registration.id} 
                            size={70} 
                            level={"M"}
                            includeMargin={false}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text)' }}>Check-in Pass</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Show this at the entrance</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn-danger-outline"
                          onClick={() =>
                            setCancelTarget(
                              registration
                            )
                          }
                        >
                          Cancel Registration
                        </button>
                      </>
                    )}

                    {status === "waitlisted" && (
                      <button
                        type="button"
                        className="btn-danger-outline"
                        onClick={() =>
                          setCancelTarget(
                            registration
                          )
                        }
                      >
                        Leave Waitlist
                      </button>
                    )}

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* CANCEL MODAL */}
      {cancelTarget && (
        <div
          className="modal-overlay"
          onClick={() =>
            !cancelling &&
            setCancelTarget(null)
          }
        >
          <div
            className="modal-container delete-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <h2>Cancel Registration</h2>

                <p>
                  Are you sure you want to cancel
                  this registration?
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                disabled={cancelling}
                onClick={() =>
                  setCancelTarget(null)
                }
              >
                <X size={22} />
              </button>

            </div>

            <div className="delete-modal-content">

              <div className="delete-warning-icon">
                !
              </div>

              <div>
                <h3>
                  {getEventTitle(
                    cancelTarget
                  )}
                </h3>

                <p>
                  Your registration will be
                  cancelled. You can register again
                  later if the event is still
                  available.
                </p>
              </div>

            </div>

            <div className="modal-actions">

              <button
                type="button"
                className="btn-secondary"
                disabled={cancelling}
                onClick={() =>
                  setCancelTarget(null)
                }
              >
                Keep Registration
              </button>

              <button
                type="button"
                className="btn-danger"
                disabled={cancelling}
                onClick={handleCancel}
              >
                {cancelling
                  ? "Cancelling..."
                  : "Cancel Registration"}
              </button>

            </div>

          </div>
        </div>
      )}

    </section>
  );
};

export default StudentMyEvents;