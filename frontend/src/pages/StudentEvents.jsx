import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Search,
  Users,
  Clock3,
  X,
} from "lucide-react";
import {
  getEvents,
  registerForEvent,
} from "../api";

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [search, setSearch] = useState("");
const [category, setCategory] = useState("All");
const [selectedEvent, setSelectedEvent] = useState(null);

const [registering, setRegistering] = useState(false);
const [registrationMessage, setRegistrationMessage] =
  useState("");
const [registrationError, setRegistrationError] =
  useState("");

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getEvents({ upcoming: true });

      const data = Array.isArray(response)
        ? response
        : response?.results || [];

      setEvents(data);
    } catch (err) {
      console.error("Student events error:", err);
      setError("Unable to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const categories = useMemo(() => {
    const values = events
      .map((event) => event.category)
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !searchText ||
        event.title?.toLowerCase().includes(searchText) ||
        event.description?.toLowerCase().includes(searchText) ||
        event.location?.toLowerCase().includes(searchText) ||
        event.venue_name?.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All" ||
        event.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [events, search, category]);

  const getEventDate = (event) => {
    const rawDate =
  event.start_date ||
  event.start_time ||
  event.start ||
  event.date ||
  event.event_date;
    if (!rawDate) return null;

    const date = new Date(rawDate);

    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatDate = (event) => {
    const date = getEventDate(event);

    if (!date) return "Date not specified";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (event) => {
    const date = getEventDate(event);

    if (!date) return "Time not specified";

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLocation = (event) =>
    event.venue_name ||
    event.venue?.name ||
    event.location ||
    "Venue not specified";

  const getCapacity = (event) =>
    event.capacity ||
    event.venue?.capacity ||
    "Not specified";
  
  const handleRegister = async () => {
  if (!selectedEvent) return;

  try {
    setRegistering(true);
    setRegistrationMessage("");
    setRegistrationError("");

    const response = await registerForEvent(
      selectedEvent.id
    );

    setRegistrationMessage(
      response?.detail ||
        `You have successfully registered for ${selectedEvent.title}.`
    );
  } catch (err) {
    console.error("Registration error:", err);

    const message =
      err?.data?.detail ||
      err?.data?.event_id?.[0] ||
      err?.data?.non_field_errors?.[0] ||
      (err?.data && typeof err.data === "object" ? Object.values(err.data)[0]?.[0] : null) ||
      err?.message ||
      "Unable to register for this event.";

    setRegistrationError(message);
  } finally {
    setRegistering(false);
  }
};

  return (
    <section className="student-events-page">

      {/* PAGE HEADER */}
      <div className="student-page-heading">
        <div>
          <div className="student-welcome">
            STUDENT EVENTS
          </div>

          <h1>Browse Events</h1>

          <p>
            Discover upcoming events and activities
            happening on campus.
          </p>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="student-events-toolbar">

        <div className="student-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <select
          className="student-filter-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "All"
                ? "All Categories"
                : item}
            </option>
          ))}
        </select>
      </div>

      {/* SUMMARY */}
      <div className="student-events-summary">
        <span>
          {loading
            ? "Loading events..."
            : `${filteredEvents.length} event${
                filteredEvents.length === 1 ? "" : "s"
              } found`}
        </span>
      </div>

      {/* ERROR */}
      {error && (
        <div className="student-empty-state">
          <p>{error}</p>

          <button
            type="button"
            className="primary-button"
            onClick={loadEvents}
          >
            Try Again
          </button>
        </div>
      )}

      {/* EVENTS */}
      {!error && (
        <div className="student-events-grid">

          {loading ? (
            <div className="student-empty-state">
              <Clock3 size={28} />
              <h3>Loading events...</h3>
              <p>
                Please wait while we fetch upcoming
                campus events.
              </p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="student-empty-state">
              <CalendarDays size={30} />
              <h3>No events found</h3>
              <p>
                Try changing your search or category
                filter.
              </p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                className="student-event-card"
                key={event.id}
              >
                <div className="student-event-card-header">

                  <span
                    className={`student-category ${
                      event.category
                        ?.toLowerCase()
                        .replace(/\s+/g, "-") ||
                      "technical"
                    }`}
                  >
                    {event.category || "General"}
                  </span>

                  <span className="student-event-status">
                    Upcoming
                  </span>

                </div>

                <h2>
                  {event.title || "Untitled Event"}
                </h2>

                <p className="student-event-description">
                  {event.description ||
                    "Join this upcoming campus event and take part in an engaging college experience."}
                </p>

                <div className="student-event-details">

                  <div className="student-event-detail">
                    <CalendarDays size={15} />
                    <span>
                      {formatDate(event)}
                    </span>
                  </div>

                  <div className="student-event-detail">
                    <Clock3 size={15} />
                    <span>
                      {formatTime(event)}
                    </span>
                  </div>

                  <div className="student-event-detail">
                    <MapPin size={15} />
                    <span>
                      {getLocation(event)}
                    </span>
                  </div>

                  <div className="student-event-detail">
                    <Users size={15} />
                    <span>
                      Capacity: {getCapacity(event)}
                    </span>
                  </div>

                </div>

                <button
                  type="button"
                  className="student-register-button"
                  onClick={() =>
                    setSelectedEvent(event)
                  }
                >
                  View Event
                </button>

              </div>
            ))
          )}

        </div>
      )}

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">

              <div>
                <h2>
                  {selectedEvent.title ||
                    "Event Details"}
                </h2>

                <p>
                  {selectedEvent.category ||
                    "Campus Event"}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setSelectedEvent(null)
                }
              >
                <X size={22} />
              </button>

            </div>

            <div className="student-event-details">

              <div className="student-event-detail">
                <CalendarDays size={16} />
                <span>
                  {formatDate(selectedEvent)}
                </span>
              </div>

              <div className="student-event-detail">
                <Clock3 size={16} />
                <span>
                  {formatTime(selectedEvent)}
                </span>
              </div>

              <div className="student-event-detail">
                <MapPin size={16} />
                <span>
                  {getLocation(selectedEvent)}
                </span>
              </div>

              <div className="student-event-detail">
                <Users size={16} />
                <span>
                  Capacity: {getCapacity(selectedEvent)}
                </span>
              </div>

            </div>

            <div className="student-detail-description">
              <h3>About this event</h3>

              <p>
                {selectedEvent.description ||
                  "No additional description is available for this event."}
              </p>
            </div>

            {registrationMessage && (
  <div className="student-registration-success">
    {registrationMessage}
  </div>
)}

{registrationError && (
  <div className="student-registration-error">
    {registrationError}
  </div>
)}

            <div className="modal-actions">

              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  setSelectedEvent(null)
                }
              >
                Close
              </button>

              {selectedEvent.registration_status === "registered" ? (
                <button
                  type="button"
                  className="primary-button"
                  disabled
                >
                  Already Registered
                </button>
              ) : selectedEvent.registration_status === "waitlisted" ? (
                <button
                  type="button"
                  className="primary-button"
                  disabled
                >
                  Waitlisted
                </button>
              ) : (
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleRegister}
                  disabled={registering}
                >
                  {registering
                    ? "Registering..."
                    : "Register for Event"}
                </button>
              )}

            </div>

          </div>
        </div>
      )}

    </section>
  );
};

export default StudentEvents;