import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Star,
  MapPin,
  ArrowRight,
  Search,
  History,
  Sparkles,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { getEvents, getRegistrations } from "../api";

function StudentDashboard() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [eventsResponse, registrationsResponse] =
        await Promise.all([
          getEvents({ upcoming: true }),
          getRegistrations(),
        ]);

      setEvents(
        Array.isArray(eventsResponse)
          ? eventsResponse
          : eventsResponse?.results || []
      );

      setRegistrations(
        Array.isArray(registrationsResponse)
          ? registrationsResponse
          : registrationsResponse?.results || []
      );
    } catch (error) {
      console.error("Student dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const registeredCount = registrations.filter(
    (registration) =>
      registration.status === "registered"
  ).length;

  const attendedCount = registrations.filter(
    (registration) =>
      registration.status === "checked-in"
  ).length;

  const upcomingRegistrations = registrations.filter(
    (registration) =>
      registration.status === "registered" ||
      registration.status === "waitlisted"
  );

  const upcomingEvents = events.slice(0, 4);

  const getEventTitle = (registration) =>
    registration.event_title ||
    registration.event?.title ||
    registration.event_name ||
    "Event";

  const getEventDate = (event) => {
    const rawDate =
      event.start_time ||
      event.start ||
      event.date ||
      event.event_date;

    if (!rawDate) return null;

    const date = new Date(rawDate);

    if (Number.isNaN(date.getTime())) return null;

    return date;
  };

  const formatDate = (event) => {
    const date = getEventDate(event);

    if (!date) {
      return {
        day: "--",
        month: "---",
      };
    }

    return {
      day: date.getDate(),
      month: date.toLocaleDateString("en-US", {
        month: "short",
      }),
    };
  };

  const getLocation = (event) =>
    event.venue_name ||
    event.venue?.name ||
    event.location ||
    "Venue not specified";

  return (
    <section className="student-dashboard">

      {/* =========================
          HEADER
      ========================== */}

      <div className="student-page-heading">

        <div>
          <div className="student-welcome">
            STUDENT DASHBOARD
          </div>

          <h1>
            Welcome back!
          </h1>

          <p>
            Discover events, manage your registrations,
            and keep track of your campus activities.
          </p>
        </div>

        <NavLink
          to="/student/events"
          className="primary-button"
        >
          <Search size={15} />
          Browse Events
        </NavLink>

      </div>


      {/* =========================
          STATISTICS
      ========================== */}

      <div className="student-stats-grid">

        <div className="student-stat-card">

          <div className="student-stat-top">
            <div className="student-stat-icon blue">
              <CalendarDays size={21} />
            </div>
          </div>

          <h3>
            {loading ? "--" : upcomingRegistrations.length}
          </h3>

          <p>
            Upcoming Events
          </p>

        </div>


        <div className="student-stat-card">

          <div className="student-stat-top">
            <div className="student-stat-icon green">
              <CheckCircle2 size={21} />
            </div>
          </div>

          <h3>
            {loading ? "--" : registeredCount}
          </h3>

          <p>
            Registered Events
          </p>

        </div>


        <div className="student-stat-card">

          <div className="student-stat-top">
            <div className="student-stat-icon purple">
              <History size={21} />
            </div>
          </div>

          <h3>
            {loading ? "--" : attendedCount}
          </h3>

          <p>
            Events Attended
          </p>

        </div>


        <div className="student-stat-card">

          <div className="student-stat-top">
            <div className="student-stat-icon orange">
              <Star size={21} />
            </div>
          </div>

          <h3>
            0
          </h3>

          <p>
            Feedback Given
          </p>

        </div>

      </div>


      {/* =========================
          MAIN CONTENT
      ========================== */}

      <div className="student-content-grid">

        {/* Upcoming Events */}

        <div className="student-card">

          <div className="student-card-header">

            <div>
              <h2>
                Upcoming Events
              </h2>

              <p>
                Events happening soon on campus
              </p>
            </div>

            <NavLink
              to="/student/events"
              className="text-button"
            >
              View All
              <ArrowRight size={14} />
            </NavLink>

          </div>


          <div className="student-event-list">

            {loading ? (

              <div className="student-empty-state">
                <Clock3 size={25} />
                <p>
                  Loading upcoming events...
                </p>
              </div>

            ) : upcomingEvents.length === 0 ? (

              <div className="student-empty-state">
                <CalendarDays size={28} />

                <h3>
                  No upcoming events
                </h3>

                <p>
                  There are currently no upcoming
                  events available.
                </p>
              </div>

            ) : (

              upcomingEvents.map((event) => {

                const date = formatDate(event);

                return (
                  <div
                    className="student-event-item"
                    key={event.id}
                  >

                    <div className="student-event-date">

                      <strong>
                        {date.day}
                      </strong>

                      <span>
                        {date.month}
                      </span>

                    </div>


                    <div className="student-event-info">

                      <h3>
                        {event.title ||
                          "Untitled Event"}
                      </h3>

                      <p>
                        <MapPin size={11} />
                        {" "}
                        {getLocation(event)}
                      </p>

                    </div>


                    <span className="student-event-status">
                      Upcoming
                    </span>

                  </div>
                );
              })

            )}

          </div>

        </div>


        {/* Quick Actions */}

        <div className="student-card">

          <div className="student-card-header">

            <div>
              <h2>
                Quick Actions
              </h2>

              <p>
                Frequently used student features
              </p>
            </div>

          </div>


          <div className="student-quick-actions">

            <NavLink
              to="/student/events"
              className="student-quick-action"
            >
              <Search size={22} />

              <span>
                Find Events
              </span>
            </NavLink>


            <NavLink
              to="/student/my-events"
              className="student-quick-action"
            >
              <CalendarDays size={22} />

              <span>
                My Events
              </span>
            </NavLink>


            <NavLink
              to="/student/recommendations"
              className="student-quick-action"
            >
              <Sparkles size={22} />

              <span>
                Recommendations
              </span>
            </NavLink>


            <NavLink
              to="/student/feedback"
              className="student-quick-action"
            >
              <Star size={22} />

              <span>
                Give Feedback
              </span>
            </NavLink>

          </div>

        </div>

      </div>


      {/* =========================
          RECENT REGISTRATIONS
      ========================== */}

      <div className="student-card">

        <div className="student-card-header">

          <div>
            <h2>
              My Recent Registrations
            </h2>

            <p>
              Your latest event registrations
            </p>
          </div>

          <NavLink
            to="/student/my-events"
            className="text-button"
          >
            View All
            <ArrowRight size={14} />
          </NavLink>

        </div>


        {registrations.length === 0 ? (

          <div className="student-empty-state">
            <CalendarDays size={28} />

            <h3>
              No registrations yet
            </h3>

            <p>
              Browse available events and register
              for your first event.
            </p>
          </div>

        ) : (

          <div className="student-event-list">

            {registrations.slice(0, 4).map(
              (registration) => (

                <div
                  className="student-event-item"
                  key={registration.id}
                >

                  <div className="student-event-date">
                    <CheckCircle2 size={19} />
                  </div>


                  <div className="student-event-info">

                    <h3>
                      {getEventTitle(
                        registration
                      )}
                    </h3>

                    <p>
                      Registration status
                    </p>

                  </div>


                  <span
                    className={`student-status ${
                      registration.status ||
                      "registered"
                    }`}
                  >
                    {registration.status ||
                      "registered"}
                  </span>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </section>
  );
}

export default StudentDashboard;