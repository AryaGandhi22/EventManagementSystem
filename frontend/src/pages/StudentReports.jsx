import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  History,
  Sparkles,
  TrendingUp,
  BarChart3,
  Download,
} from "lucide-react";
import { getRegistrations, getEvents } from "../api";

const StudentReports = () => {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      setLoading(true);

      const [registrationsResponse, eventsResponse] =
        await Promise.all([
          getRegistrations(),
          getEvents(),
        ]);

      const registrationData = Array.isArray(
        registrationsResponse
      )
        ? registrationsResponse
        : registrationsResponse?.results || [];

      const eventData = Array.isArray(eventsResponse)
        ? eventsResponse
        : eventsResponse?.results || [];

      setRegistrations(registrationData);
      setEvents(eventData);
    } catch (error) {
      console.error("Student reports error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const registeredCount = registrations.filter(
    (registration) =>
      registration.status === "registered"
  ).length;

  const waitlistedCount = registrations.filter(
    (registration) =>
      registration.status === "waitlisted"
  ).length;

  const attendedCount = registrations.filter(
    (registration) =>
      registration.status === "checked-in"
  ).length;

  const cancelledCount = registrations.filter(
    (registration) =>
      registration.status === "cancelled"
  ).length;

  const attendanceRate =
    registrations.length > 0
      ? Math.round(
          (attendedCount / registrations.length) *
            100
        )
      : 0;

  const categoryBreakdown = useMemo(() => {
    const counts = {};

    registrations.forEach((registration) => {
      const event =
        registration.event_details ||
        registration.event ||
        {};

      const category =
        event.category ||
        registration.category ||
        "General";

      counts[category] =
        (counts[category] || 0) + 1;
    });

    return Object.entries(counts).sort(
      (a, b) => b[1] - a[1]
    );
  }, [registrations]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();

    return events.filter((event) => {
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
        date >= now
      );
    }).length;
  }, [events]);

  const exportReport = () => {
    const rows = [
      [
        "Report",
        "Value",
      ],
      [
        "Total Registrations",
        registrations.length,
      ],
      [
        "Registered",
        registeredCount,
      ],
      [
        "Waitlisted",
        waitlistedCount,
      ],
      [
        "Attended",
        attendedCount,
      ],
      [
        "Cancelled",
        cancelledCount,
      ],
      [
        "Attendance Rate",
        `${attendanceRate}%`,
      ],
      [
        "Upcoming Events Available",
        upcomingEvents,
      ],
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(
              /"/g,
              '""'
            )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "student-report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <section className="student-reports-page">

      {/* HEADER */}
      <div className="student-page-heading">
        <div>
          <div className="student-welcome">
            STUDENT REPORTS
          </div>

          <h1>My Reports</h1>

          <p>
            Track your event participation,
            attendance, and activity summary.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={exportReport}
        >
          <Download size={15} />
          Export Report
        </button>
      </div>

      {/* SUMMARY */}
      <div className="student-report-summary">

        <div className="student-report-card">
          <div className="student-report-icon blue">
            <CalendarDays size={21} />
          </div>

          <div>
            <span>Total Registrations</span>

            <strong>
              {loading
                ? "--"
                : registrations.length}
            </strong>
          </div>
        </div>

        <div className="student-report-card">
          <div className="student-report-icon green">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Events Attended</span>

            <strong>
              {loading
                ? "--"
                : attendedCount}
            </strong>
          </div>
        </div>

        <div className="student-report-card">
          <div className="student-report-icon purple">
            <TrendingUp size={21} />
          </div>

          <div>
            <span>Attendance Rate</span>

            <strong>
              {loading
                ? "--"
                : `${attendanceRate}%`}
            </strong>
          </div>
        </div>

        <div className="student-report-card">
          <div className="student-report-icon orange">
            <Sparkles size={21} />
          </div>

          <div>
            <span>Upcoming Available</span>

            <strong>
              {loading
                ? "--"
                : upcomingEvents}
            </strong>
          </div>
        </div>

      </div>

      {/* REPORT GRID */}
      <div className="student-report-grid">

        {/* MY EVENTS */}
        <div className="student-report-panel">

          <div className="student-card-header">
            <div>
              <h2>My Events</h2>
              <p>
                Registration activity summary
              </p>
            </div>

            <CalendarDays size={20} />
          </div>

          <div className="student-report-stat-list">

            <div>
              <span>
                <CheckCircle2 size={15} />
                Registered
              </span>

              <strong>
                {loading
                  ? "--"
                  : registeredCount}
              </strong>
            </div>

            <div>
              <span>
                <Clock3 size={15} />
                Waitlisted
              </span>

              <strong>
                {loading
                  ? "--"
                  : waitlistedCount}
              </strong>
            </div>

            <div>
              <span>
                <History size={15} />
                Attended
              </span>

              <strong>
                {loading
                  ? "--"
                  : attendedCount}
              </strong>
            </div>

            <div>
              <span>
                <BarChart3 size={15} />
                Cancelled
              </span>

              <strong>
                {loading
                  ? "--"
                  : cancelledCount}
              </strong>
            </div>

          </div>

        </div>

        {/* EVENT HISTORY */}
        <div className="student-report-panel">

          <div className="student-card-header">
            <div>
              <h2>Event History</h2>

              <p>
                Your participation summary
              </p>
            </div>

            <History size={20} />
          </div>

          <div className="student-report-history">

            <div className="student-report-history-main">
              <strong>
                {loading
                  ? "--"
                  : attendedCount}
              </strong>

              <span>Events attended</span>
            </div>

            <div className="student-attendance-bar">

              <div
                style={{
                  width: `${attendanceRate}%`,
                }}
              />

            </div>

            <div className="student-attendance-label">
              <span>Attendance rate</span>
              <strong>
                {loading
                  ? "--"
                  : `${attendanceRate}%`}
              </strong>
            </div>

          </div>

        </div>

      </div>

      {/* CATEGORY ANALYSIS */}
      <div className="student-card">

        <div className="student-card-header">
          <div>
            <h2>My Event Interests</h2>

            <p>
              Categories based on your
              registrations.
            </p>
          </div>

          <BarChart3 size={20} />
        </div>

        {loading ? (
          <div className="student-empty-state">
            <Clock3 size={28} />

            <h3>Loading report...</h3>

            <p>
              Preparing your event activity
              summary.
            </p>
          </div>
        ) : categoryBreakdown.length === 0 ? (
          <div className="student-empty-state">
            <Sparkles size={28} />

            <h3>No activity yet</h3>

            <p>
              Register for events to build your
              personalized activity report.
            </p>
          </div>
        ) : (
          <div className="student-category-report">

            {categoryBreakdown.map(
              ([category, count]) => {

                const percentage =
                  registrations.length > 0
                    ? Math.round(
                        (count /
                          registrations.length) *
                          100
                      )
                    : 0;

                return (
                  <div
                    className="student-category-report-row"
                    key={category}
                  >

                    <div className="student-category-report-label">
                      <span>
                        {category}
                      </span>

                      <strong>
                        {count}
                      </strong>
                    </div>

                    <div className="student-category-report-bar">
                      <div
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

      {/* PERSONALIZED RECOMMENDATIONS */}
      <div className="student-report-panel student-report-recommendation-panel">

        <div className="student-card-header">
          <div>
            <h2>
              Personalized Recommendations
            </h2>

            <p>
              Use your activity to discover
              events that match your interests.
            </p>
          </div>

          <Sparkles size={20} />
        </div>

        <div className="student-report-recommendation-content">

          <div className="student-report-recommendation-icon">
            <Sparkles size={28} />
          </div>

          <div>
            <h3>
              Discover more campus events
            </h3>

            <p>
              Your registration history can be used
              to identify event categories you may
              enjoy.
            </p>

            <a
              href="/student/recommendations"
              className="text-button"
            >
              View Recommendations
              <span>→</span>
            </a>
          </div>

        </div>

      </div>

    </section>
  );
};

export default StudentReports;