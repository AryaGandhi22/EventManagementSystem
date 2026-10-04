import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Sparkles,
  ArrowRight,
  Search,
  Star,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { getEvents } from "../api";

const StudentRecommendations = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      setLoading(true);

      const response = await getEvents({ upcoming: true });

      const data = Array.isArray(response)
        ? response
        : response?.results || [];

      setEvents(data);
    } catch (error) {
      console.error("Recommendations error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const recommendations = useMemo(() => {
    return [...events]
      .filter((event) => {
        const rawDate =
          event.start_date ||
          event.start_time ||
          event.start ||
          event.date ||
          event.event_date;

        if (!rawDate) return true;

        const date = new Date(rawDate);

        return (
          !Number.isNaN(date.getTime()) &&
          date >= new Date()
        );
      })
      .slice(0, 6);
  }, [events]);

  const getCategory = (event) =>
    event.category || "General";

  const getLocation = (event) =>
    event.venue?.name ||
    event.venue_name ||
    event.location ||
    "Venue not specified";

  const getDate = (event) => {
    const rawDate =
      event.start_date ||
      event.start_time ||
      event.start ||
      event.date ||
      event.event_date;

    if (!rawDate) return "Date not specified";

    const date = new Date(rawDate);

    if (Number.isNaN(date.getTime())) {
      return "Date not specified";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getReason = (event) => {
    const category = getCategory(event).toLowerCase();

    if (category.includes("technical")) {
      return "Matches your technical interests";
    }

    if (category.includes("academic")) {
      return "Recommended for academic development";
    }

    if (category.includes("cultural")) {
      return "Popular campus activity";
    }

    return "Recommended for you";
  };

  return (
    <section className="student-recommendations-page">

      {/* HEADER */}
      <div className="student-page-heading">
        <div>
          <div className="student-welcome">
            RECOMMENDATIONS
          </div>

          <h1>Recommended for You</h1>

          <p>
            Discover upcoming campus events that
            may be a good fit for you.
          </p>
        </div>

        <NavLink
          to="/student/events"
          className="primary-button"
        >
          <Search size={15} />
          Browse All Events
        </NavLink>
      </div>

      {/* BANNER */}
      <div className="student-recommendations-banner">
        <div className="student-recommendations-banner-icon">
          <Sparkles size={25} />
        </div>

        <div>
          <h2>Find your next event</h2>

          <p>
            Explore technical, academic, cultural,
            and other campus activities selected
            for you.
          </p>
        </div>
      </div>

      {/* RECOMMENDATIONS */}
      <div className="student-card">

        <div className="student-card-header">
          <div>
            <h2>Top Recommendations</h2>

            <p>
              Upcoming events you may be interested in.
            </p>
          </div>

          <span className="student-recommendation-count">
            {recommendations.length} events
          </span>
        </div>

        {loading ? (
          <div className="student-empty-state">
            <Sparkles size={30} />

            <h3>Finding events for you...</h3>

            <p>
              Please wait while we load upcoming
              events.
            </p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="student-empty-state">
            <CalendarDays size={30} />

            <h3>No recommendations available</h3>

            <p>
              Check back later when more events are
              available.
            </p>

            <NavLink
              to="/student/events"
              className="primary-button"
            >
              Browse Events
              <ArrowRight size={15} />
            </NavLink>
          </div>
        ) : (
          <div className="student-recommendation-grid">

            {recommendations.map((event) => (
              <div
                className="student-recommendation-card"
                key={event.id}
              >

                <div className="student-recommendation-card-top">

                  <span
                    className={`student-category ${String(
                      getCategory(event)
                    ).toLowerCase()}`}
                  >
                    {getCategory(event)}
                  </span>

                  <span className="student-match-badge">
                    <Sparkles size={12} />
                    Recommended
                  </span>

                </div>

                <h3>
                  {event.title || "Untitled Event"}
                </h3>

                <p className="student-recommendation-reason">
                  <Star size={13} />
                  {getReason(event)}
                </p>

                <p className="student-event-description">
                  {event.description ||
                    "Join this upcoming campus event and take part in the experience."}
                </p>

                <div className="student-event-details">

                  <div className="student-event-detail">
                    <CalendarDays size={14} />
                    <span>
                      {getDate(event)}
                    </span>
                  </div>

                  <div className="student-event-detail">
                    <MapPin size={14} />
                    <span>
                      {getLocation(event)}
                    </span>
                  </div>

                </div>

                <NavLink
                  to="/student/events"
                  className="student-recommendation-view"
                >
                  View Event
                  <ArrowRight size={14} />
                </NavLink>

              </div>
            ))}

          </div>
        )}

      </div>

    </section>
  );
};

export default StudentRecommendations;