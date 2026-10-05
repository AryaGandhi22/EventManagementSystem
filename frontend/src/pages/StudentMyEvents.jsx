import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  X,
  CheckCircle2,
  AlertCircle,
  Ban,
  Users,
  UserPlus,
  Printer,
  Ticket,
} from "lucide-react";
import { getRegistrations, cancelRegistration, toggleConnectOptIn, getEventAttendees } from "../api";
import { QRCodeSVG } from "qrcode.react";

const StudentMyEvents = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("upcoming");

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const [ticketModalTarget, setTicketModalTarget] = useState(null);

  const [message, setMessage] = useState("");

  const [attendeesModal, setAttendeesModal] = useState(null);
  const [attendeesList, setAttendeesList] = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

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

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return registrations.filter((registration) => {
      const status = getStatus(registration);
      if (status === "cancelled") return false;

      const eventDate = getEventDate(registration);
      const event = getEvent(registration);
      const endDateRaw = event.end_date || event.end_time || event.end;
      const endDate = endDateRaw ? new Date(endDateRaw) : eventDate;

      // Any event scheduled for today or in the future is UPCOMING
      if (endDate && endDate >= now) {
        return true;
      }
      if (eventDate && eventDate >= now) {
        return true;
      }

      if (!eventDate && ["registered", "waitlisted"].includes(status)) {
        return true;
      }

      return false;
    });
  }, [registrations]);

  const cancelledEvents = useMemo(
    () =>
      registrations.filter(
        (registration) => getStatus(registration) === "cancelled"
      ),
    [registrations]
  );

  const completedEvents = useMemo(() => {
    const now = new Date();
    return registrations.filter((registration) => {
      const status = getStatus(registration);
      if (status === "cancelled") return false;

      const eventDate = getEventDate(registration);
      const event = getEvent(registration);
      const endDateRaw = event.end_date || event.end_time || event.end;
      const endDate = endDateRaw ? new Date(endDateRaw) : eventDate;

      // An event is completed ONLY if its end date/start date has passed or status is completed
      if (status === "completed") return true;
      if (endDate && endDate < now) return true;

      return false;
    });
  }, [registrations]);

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

  const handleToggleOptIn = async (registration, e) => {
    e.stopPropagation();
    try {
      const newOptIn = !registration.connect_opt_in;
      await toggleConnectOptIn(registration.id, newOptIn);
      setRegistrations(registrations.map(r => r.id === registration.id ? { ...r, connect_opt_in: newOptIn } : r));
    } catch (err) {
      setError(err?.data?.detail || "Unable to update networking preference.");
    }
  };

  const viewAttendees = async (event, e) => {
    if (e) e.stopPropagation();
    setAttendeesModal(event);
    setLoadingAttendees(true);
    try {
      const list = await getEventAttendees(event.id);
      setAttendeesList(list);
    } catch (err) {
      setError("Unable to fetch attendees.");
    } finally {
      setLoadingAttendees(false);
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

                    {(() => {
                      const now = new Date();
                      const event = getEvent(registration);
                      const startRaw = event.start_date || event.start_time || event.start || event.date;
                      const endRaw = event.end_date || event.end_time || event.end;
                      const startDate = startRaw ? new Date(startRaw) : null;
                      const endDate = endRaw ? new Date(endRaw) : startDate;
                      const isEventPast = activeTab === "completed" || (endDate ? endDate < now : (startDate ? startDate < now : false)) || status === "completed";
                      const isCheckedIn = registration.checked_in || status === "checked-in";

                      if (isEventPast) {
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            {isCheckedIn ? (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#dcfce7', color: '#15803d', padding: '8px 18px', borderRadius: '12px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #bbf7d0' }}>
                                <CheckCircle2 size={16} /> Attended / Checked-In
                              </div>
                            ) : (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', color: '#64748b', padding: '8px 18px', borderRadius: '12px', fontWeight: '600', fontSize: '0.85rem', border: '1px solid #cbd5e1' }}>
                                <Clock3 size={16} /> Event Closed / Pass Expired
                              </div>
                            )}

                            {registration.connect_opt_in && (
                              <button
                                type="button"
                                className="btn-secondary"
                                onClick={(e) => viewAttendees(registration.event_details || { id: registration.event_id, title: registration.event }, e)}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 14px' }}
                              >
                                <Users size={14} /> View Attendees
                              </button>
                            )}
                          </div>
                        );
                      }

                      if (status === "registered") {
                        return (
                          <>
                            <div 
                              className="student-qr-code-section" 
                              onClick={() => setTicketModalTarget(registration)} 
                              title="Click to view full ticket pass" 
                              style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                            >
                              <QRCodeSVG 
                                value={registration.qr_token || registration.qr_code || registration.id} 
                                size={65} 
                                level={"M"}
                                includeMargin={false}
                              />
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div>
                                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Ticket size={15} style={{ color: '#2563eb' }} /> Check-in Pass
                                  </span>
                                  <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: '600', display: 'block', marginTop: '2px' }}>Click for Full Pass ➔</span>
                                </div>
                                
                                <label className="networking-toggle" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--primary)' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={registration.connect_opt_in} 
                                    onChange={(e) => handleToggleOptIn(registration, e)} 
                                    style={{ cursor: 'pointer' }}
                                  />
                                  Opt-in to Networking
                                </label>
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {registration.connect_opt_in && (
                                <button
                                  type="button"
                                  className="btn-secondary"
                                  onClick={(e) => viewAttendees(registration.event_details || { id: registration.event_id, title: registration.event }, e)}
                                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px' }}
                                >
                                  <Users size={14} /> Fellow Attendees
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn-danger-outline"
                                onClick={() => setCancelTarget(registration)}
                              >
                                Cancel Registration
                              </button>
                            </div>
                          </>
                        );
                      }

                      return null;
                    })()}

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

      {attendeesModal && (
        <div className="modal-overlay" onClick={() => setAttendeesModal(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header">
              <div>
                <h2>Networking: {attendeesModal.title || "Fellow Attendees"}</h2>
                <p>Connect with other students attending this event.</p>
              </div>
              <button type="button" className="modal-close" onClick={() => setAttendeesModal(null)}>
                <X size={22} />
              </button>
            </div>
            
            <div className="modal-content" style={{ maxHeight: '400px', overflowY: 'auto', padding: '20px' }}>
              {loadingAttendees ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-light)' }}>
                  <Clock3 size={24} style={{ marginBottom: '10px' }} />
                  <p>Finding attendees...</p>
                </div>
              ) : attendeesList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-light)' }}>
                  <Users size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
                  <p>No other attendees have opted into networking for this event yet.</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '10px' }}>Check back later as more students register!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {attendeesList.map(attendee => (
                    <div key={attendee.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {attendee.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: 'var(--text)' }}>{attendee.name}</h4>
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            {attendee.interests && attendee.interests.length > 0 ? (
                              attendee.interests.slice(0, 3).map((interest, i) => (
                                <span key={i} style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-light)' }}>
                                  {interest}
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Student</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <a 
                        href={`mailto:${attendee.email}?subject=Hello from ${attendeesModal.title}`}
                        className="btn-primary" 
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px', textDecoration: 'none' }}
                      >
                        <UserPlus size={14} /> Connect
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TICKET PASS MODAL */}
      {ticketModalTarget && (() => {
        const reg = ticketModalTarget;
        const event = getEvent(reg);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const studentName = reg.student_name || reg.student_details?.name || user.name || user.username || "Student";
        const studentEmail = reg.student_email || reg.student_details?.email || user.email || "";
        const studentRoll = reg.student_roll_number || user.roll_number || "STU-" + String(reg.id).slice(-4);
        const qrValue = reg.qr_token || reg.qr_code || reg.id;
        const isCheckedIn = reg.checked_in || reg.status === "checked-in";
        const isCancelled = reg.status === "cancelled";

        const now = new Date();
        const eventDate = getEventDate(reg);
        const endDateRaw = event.end_date || event.end_time || event.end;
        const endDate = endDateRaw ? new Date(endDateRaw) : eventDate;
        const isPastEvent = (endDate && endDate < now) || (eventDate && eventDate < now) || event.status === "completed";

        return (
          <div className="modal-overlay" onClick={() => setTicketModalTarget(null)} style={{ zIndex: 1100 }}>
            <div 
              className="modal-container" 
              onClick={(e) => e.stopPropagation()} 
              style={{ maxWidth: '460px', width: '90%', padding: '0', overflow: 'hidden', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
              {/* Ticket Top Banner */}
              <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', padding: '24px 20px', color: '#ffffff', position: 'relative' }}>
                <button 
                  type="button" 
                  onClick={() => setTicketModalTarget(null)} 
                  style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={18} />
                </button>
                
                <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '3px 10px', borderRadius: '12px', marginBottom: '8px' }}>
                  Official Event Pass
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 4px 0', color: '#ffffff' }}>{getEventTitle(reg)}</h2>
                <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: 0 }}>{event.category || "Campus Event"}</p>
              </div>

              {/* Ticket Content */}
              <div style={{ padding: '24px', background: '#ffffff' }}>
                {/* Attendance Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
                  {isCheckedIn ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#15803d', padding: '6px 16px', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #bbf7d0' }}>
                      <CheckCircle2 size={16} /> Checked-In {reg.checked_in_at ? `(${new Date(reg.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}
                    </div>
                  ) : isCancelled ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#b91c1c', padding: '6px 16px', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #fecaca' }}>
                      <Ban size={16} /> Cancelled
                    </div>
                  ) : isPastEvent ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', color: '#64748b', padding: '6px 16px', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #cbd5e1' }}>
                      <Clock3 size={16} /> Event Ended / Expired Pass
                    </div>
                  ) : (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#1d4ed8', padding: '6px 16px', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #bfdbfe' }}>
                      <CheckCircle2 size={16} /> Registered / Valid Ticket
                    </div>
                  )}
                </div>

                {/* QR Code */}
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc', padding: '18px', borderRadius: '16px', border: '2px dashed #cbd5e1', marginBottom: '20px', opacity: isPastEvent && !isCheckedIn ? 0.6 : 1 }}>
                  <QRCodeSVG value={qrValue} size={180} level={"H"} includeMargin={true} />
                  {isPastEvent && !isCheckedIn && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-12deg)', background: '#dc2626', color: 'white', padding: '6px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '1px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', pointerEvents: 'none' }}>
                      PASS EXPIRED
                    </div>
                  )}
                  <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#64748b', marginTop: '8px', wordBreak: 'break-all', textAlign: 'center' }}>
                    {qrValue}
                  </span>
                </div>

                {/* Pass Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.85rem', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Attendee Name</span>
                    <strong style={{ color: '#1e293b' }}>{studentName}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Roll No / Email</span>
                    <strong style={{ color: '#1e293b', wordBreak: 'break-all' }}>{studentRoll || studentEmail}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Date & Time</span>
                    <strong style={{ color: '#1e293b' }}>{formatDate(reg)} • {formatTime(reg)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Venue</span>
                    <strong style={{ color: '#1e293b' }}>{getLocation(reg)}</strong>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', background: '#1e293b', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    <Printer size={16} /> Print Ticket Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketModalTarget(null)}
                    style={{ padding: '11px 18px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </section>
  );
};

export default StudentMyEvents;