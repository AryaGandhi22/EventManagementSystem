
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, CalendarDays, MapPin, Users, Clock, X } from "lucide-react";
import { createEvent, getEvents, getVenues, registerForEvent } from "../api";
import { errorMessage, formatDate, formatTime } from "../utils";

function Events() {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [category, setCategory] = useState("all");
  const [scope, setScope] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Technical",
    start_date: "",
    end_date: "",
    capacity: "100",
    venue_id: "",
  });

  const search = searchParams.get("search") || "";

  const load = async () => {
    setLoading(true);
    try {
      const [eventData, venueData] = await Promise.all([
        getEvents({
          search,
          category: category === "all" ? undefined : category,
          upcoming: scope === "upcoming" ? "true" : undefined,
        }),
        getVenues(),
      ]);
      setEvents(eventData);
      setVenues(venueData);
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, category, scope]);

  useEffect(() => {
    if (venues.length > 0 && !form.venue_id) {
      setForm((old) => ({ ...old, venue_id: String(venues[0].id) }));
    }
  }, [venues]);

  const filteredEvents = useMemo(() => {
    if (scope !== "completed") return events;
    return events.filter((event) => new Date(event.end_date) < new Date());
  }, [events, scope]);

  const openForm = () => {
    setMessage("");
    setError("");
    if (venues.length === 0) {
      setError("Please create a venue first before creating an event.");
      return;
    }
    setForm({
      title: "",
      description: "",
      category: "Technical",
      start_date: "",
      end_date: "",
      capacity: "100",
      venue_id: String(venues[0].id),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    if (!saving) setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((old) => ({ ...old, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.title.trim()) {
      setError("Please enter an event title.");
      return;
    }
    if (!form.start_date || !form.end_date) {
      setError("Please select both the start and end date/time.");
      return;
    }
    if (new Date(form.end_date) <= new Date(form.start_date)) {
      setError("The end date/time must be after the start date/time.");
      return;
    }
    if (!Number.isInteger(Number(form.capacity)) || Number(form.capacity) < 1) {
      setError("Capacity must be a whole number greater than zero.");
      return;
    }
    if (!form.venue_id) {
      setError("Please select a venue.");
      return;
    }

    try {
      setSaving(true);
      await createEvent({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
        capacity: Number(form.capacity),
        venue_id: form.venue_id,
      });
      setShowForm(false);
      setMessage("Event created successfully.");
      await load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleRegister = async (event) => {
    try {
      await registerForEvent(event.id);
      setMessage(`${event.title}: registration submitted.`);
      await load();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const categoryClass = (value) =>
    String(value || "").toLowerCase().replaceAll(" ", "-");

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="welcome-text">College Events</p>
          <h1>Events Directory</h1>
          <p className="page-description">
            Explore upcoming events and manage your registrations.
          </p>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={openForm}
        >
          <Plus size={17} /> Create Event
        </button>
      </div>

      {message && <p className="page-description">{message}</p>}
      {error && <p className="page-description" role="alert">{error}</p>}

      <div className="events-toolbar">
        <div className="events-filters">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="technical">Technical</option>
            <option value="cultural">Cultural</option>
            <option value="sports">Sports</option>
            <option value="workshop">Workshop</option>
            <option value="academic">Academic</option>
            <option value="social">Social</option>
            <option value="seminar">Seminar</option>
          </select>

          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          >
            <option value="upcoming">Upcoming Events</option>
            <option value="all">All Events</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="events-grid">
        {loading ? (
          <p className="page-description">Loading events...</p>
        ) : filteredEvents.length === 0 ? (
          <p className="page-description">No events found.</p>
        ) : (
          filteredEvents.map((event) => {
            const status = event.registration_status;
            const full = event.available_seats <= 0;

            return (
              <div className="event-card" key={event.id}>
                <div className="event-card-header">
                  <span className={`event-category ${categoryClass(event.category)}`}>
                    {event.category}
                  </span>
                  <span className="event-open">
                    {status === "registered"
                      ? "Registered"
                      : status === "waitlisted"
                      ? "Waitlisted"
                      : full
                      ? "Full"
                      : "Open"}
                  </span>
                </div>

                <h2>{event.title}</h2>
                <p className="event-description">
                  {event.description || "College event."}
                </p>

                <div className="event-details">
                  <div>
                    <CalendarDays size={17} />
                    <span>{formatDate(event.start_date)}</span>
                  </div>
                  <div>
                    <Clock size={17} />
                    <span>{formatTime(event.start_date)}</span>
                  </div>
                  <div>
                    <MapPin size={17} />
                    <span>{event.venue?.name || "Venue TBA"}</span>
                  </div>
                  <div>
                    <Users size={17} />
                    <span>
                      {event.registration_count} / {event.capacity} registered
                    </span>
                  </div>
                </div>

                <button
                  className="event-action"
                  type="button"
                  disabled={Boolean(status) || full}
                  onClick={() => handleRegister(event)}
                >
                  {status === "registered"
                    ? "Registered"
                    : status === "waitlisted"
                    ? "Waitlisted"
                    : full
                    ? "Event Full"
                    : "Register"}
                </button>
              </div>
            );
          })
        )}
      </div>

      {showForm && (
        <div
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
            overflowY: "auto",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-event-title"
            style={{
              background: "white",
              color: "#1e293b",
              width: "100%",
              maxWidth: "620px",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "16px",
              padding: "26px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}>
              <div>
                <h2 id="create-event-title" style={{ margin: 0 }}>
                  Create New Event
                </h2>
                <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                  Enter the event details below.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
                style={{
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                  padding: "6px",
                }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ display: "grid", gap: "15px" }}>
                <label style={{ display: "grid", gap: "6px" }}>
                  <span>Event title *</span>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter event title"
                    required
                    maxLength={200}
                    style={inputStyle}
                  />
                </label>

                <label style={{ display: "grid", gap: "6px" }}>
                  <span>Description</span>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe your event"
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </label>

                <label style={{ display: "grid", gap: "6px" }}>
                  <span>Category *</span>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    {["Technical", "Cultural", "Sports", "Workshop",
                      "Academic", "Social", "Seminar"].map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "15px",
                }}>
                  <label style={{ display: "grid", gap: "6px" }}>
                    <span>Start date & time *</span>
                    <input
                      type="datetime-local"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      required
                      style={inputStyle}
                    />
                  </label>

                  <label style={{ display: "grid", gap: "6px" }}>
                    <span>End date & time *</span>
                    <input
                      type="datetime-local"
                      name="end_date"
                      value={form.end_date}
                      onChange={handleChange}
                      required
                      style={inputStyle}
                    />
                  </label>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "15px",
                }}>
                  <label style={{ display: "grid", gap: "6px" }}>
                    <span>Capacity *</span>
                    <input
                      type="number"
                      name="capacity"
                      value={form.capacity}
                      onChange={handleChange}
                      min="1"
                      step="1"
                      required
                      style={inputStyle}
                    />
                  </label>

                  <label style={{ display: "grid", gap: "6px" }}>
                    <span>Venue *</span>
                    <select
                      name="venue_id"
                      value={form.venue_id}
                      onChange={handleChange}
                      required
                      style={inputStyle}
                    >
                      {venues.map((venue) => (
                        <option key={venue.id} value={String(venue.id)}>
                          {venue.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              {error && (
                <p role="alert" style={{ color: "#b91c1c", marginTop: "14px" }}>
                  {error}
                </p>
              )}

              <div style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "24px",
              }}>
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  style={secondaryButtonStyle}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="primary-button"
                >
                  {saving ? "Creating..." : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  font: "inherit",
  background: "white",
  color: "#1e293b",
};

const secondaryButtonStyle = {
  padding: "10px 16px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  background: "white",
  color: "#334155",
  cursor: "pointer",
  font: "inherit",
};

export default Events;