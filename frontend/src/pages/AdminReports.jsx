import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Users,
  ClipboardList,
  Star,
  TrendingUp,
  CheckCircle,
  Clock,
  Download,
} from "lucide-react";

import { getReports, exportEventsCSV } from "../api";

function AdminReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const data = await getReports();

      console.log("REPORTS API DATA:", data);

      setReport(data);
    } catch (err) {
      console.error("REPORTS API ERROR:", err);
      setError(
        err?.message || "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>Reports</h1>
            <p>
              Overview of events, registrations, attendance and feedback.
            </p>
          </div>
        </div>

        <div className="admin-report-panel">
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>Reports</h1>
            <p>
              Overview of events, registrations, attendance and feedback.
            </p>
          </div>
        </div>

        <div className="admin-report-panel">
          <h2>Unable to load reports</h2>
          <p>{error}</p>

          <button
            type="button"
            onClick={loadReports}
            className="admin-report-retry"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const eventPerformance = report?.event_performance || [];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Reports</h1>
          <p>
            Overview of events, registrations, attendance and feedback.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={exportEventsCSV}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Summary cards */}

      <div className="admin-report-summary">
        <div className="admin-report-card">
          <div className="admin-report-icon">
            <CalendarDays size={21} />
          </div>

          <div>
            <span>Total Events</span>
            <strong>{report?.total_events ?? 0}</strong>

            <small>
              <TrendingUp size={13} />
              Events in system
            </small>
          </div>
        </div>

        <div className="admin-report-card">
          <div className="admin-report-icon">
            <Users size={21} />
          </div>

          <div>
            <span>Total Registrations</span>
            <strong>{report?.total_registrations ?? 0}</strong>

            <small>
              <TrendingUp size={13} />
              All registrations
            </small>
          </div>
        </div>

        <div className="admin-report-card">
          <div className="admin-report-icon">
            <CheckCircle size={21} />
          </div>

          <div>
            <span>Attendance Rate</span>
            <strong>
              {report?.attendance_rate ?? 0}%
            </strong>

            <small>
              <CheckCircle size={13} />
              {report?.total_attendance ?? 0} attended
            </small>
          </div>
        </div>

        <div className="admin-report-card">
          <div className="admin-report-icon">
            <Star size={21} />
          </div>

          <div>
            <span>Average Rating</span>
            <strong>
              {report?.average_rating ?? 0}/5
            </strong>

            <small>
              <Star size={13} />
              From {report?.review_count ?? 0} reviews
            </small>
          </div>
        </div>
      </div>

      {/* Registration status */}

      <div className="admin-report-grid">
        <div className="admin-report-panel">
          <div className="admin-report-panel-header">
            <div>
              <h2>Registration Status</h2>
              <p>Current registration breakdown.</p>
            </div>

            <ClipboardList size={20} />
          </div>

          <div className="admin-report-bars">
            <div className="admin-report-bar-row">
              <div className="admin-report-bar-label">
                <span>Registered</span>
                <strong>{report?.registered ?? 0}</strong>
              </div>

              <div className="admin-report-bar-track">
                <div
                  className="admin-report-bar-fill"
                  style={{
                    width: `${
                      report?.total_registrations
                        ? (report.registered /
                            report.total_registrations) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="admin-report-bar-row">
              <div className="admin-report-bar-label">
                <span>Waitlisted</span>
                <strong>{report?.waitlisted ?? 0}</strong>
              </div>

              <div className="admin-report-bar-track">
                <div
                  className="admin-report-bar-fill"
                  style={{
                    width: `${
                      report?.total_registrations
                        ? (report.waitlisted /
                            report.total_registrations) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="admin-report-bar-row">
              <div className="admin-report-bar-label">
                <span>Cancelled</span>
                <strong>{report?.cancelled ?? 0}</strong>
              </div>

              <div className="admin-report-bar-track">
                <div
                  className="admin-report-bar-fill"
                  style={{
                    width: `${
                      report?.total_registrations
                        ? (report.cancelled /
                            report.total_registrations) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Attendance */}

        <div className="admin-report-panel">
          <div className="admin-report-panel-header">
            <div>
              <h2>Attendance</h2>
              <p>Current event attendance overview.</p>
            </div>

            <CheckCircle size={20} />
          </div>

          <div className="admin-rating-summary">
            <div className="admin-rating-number">
              <strong>
                {report?.total_attendance ?? 0}
              </strong>

              <span>Total attendance</span>
            </div>

            <div className="admin-rating-bars">
              <div>
                <span>Attendance rate</span>

                <div>
                  <i
                    style={{
                      width: `${Math.min(
                        report?.attendance_rate ?? 0,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <strong>
                  {report?.attendance_rate ?? 0}%
                </strong>
              </div>

              <div>
                <span>Registered</span>

                <div>
                  <i
                    style={{
                      width: `${
                        report?.total_registrations
                          ? Math.min(
                              (report.registered /
                                report.total_registrations) *
                                100,
                              100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <strong>
                  {report?.registered ?? 0}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-report-grid" style={{ marginTop: '2rem' }}>
        <div className="admin-report-panel">
          <div className="admin-report-panel-header">
            <div>
              <h2>Feedback Themes</h2>
              <p>Average ratings across specific categories.</p>
            </div>
            <Star size={20} />
          </div>
          <div className="admin-rating-summary">
            <div className="admin-rating-bars" style={{ width: '100%' }}>
              <div>
                <span>Event Content</span>
                <strong>{report?.feedback_themes?.content ?? 0} / 5</strong>
              </div>
              <div>
                <span>Venue Quality</span>
                <strong>{report?.feedback_themes?.venue ?? 0} / 5</strong>
              </div>
              <div>
                <span>Value for Money</span>
                <strong>{report?.feedback_themes?.value ?? 0} / 5</strong>
              </div>
              <div>
                <span>Organization</span>
                <strong>{report?.feedback_themes?.organization ?? 0} / 5</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-report-panel">
          <div className="admin-report-panel-header">
            <div>
              <h2>Student Engagement</h2>
              <p>Platform adoption and active student users.</p>
            </div>
            <Users size={20} />
          </div>
          <div className="admin-rating-summary">
            <div className="admin-rating-number">
              <strong>{report?.student_engagement?.engagement_rate ?? 0}%</strong>
              <span>Active Students</span>
            </div>
            <div className="admin-rating-bars">
              <div>
                <span>Active Users (1+ Regs)</span>
                <strong>{report?.student_engagement?.active_students ?? 0}</strong>
              </div>
              <div>
                <span>Total Students</span>
                <strong>{report?.student_engagement?.total_students ?? 0}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Event performance */}

      <div className="admin-report-panel">
        <div className="admin-report-panel-header">
          <div>
            <h2>Event Performance</h2>
            <p>
              Registration and attendance for each event.
            </p>
          </div>

          <BarChart3 size={20} />
        </div>

        <div className="admin-report-bars">
          {eventPerformance.length === 0 ? (
            <p>No event performance data available.</p>
          ) : (
            eventPerformance.map((event) => (
              <div
                className="admin-report-bar-row"
                key={event.event_id}
              >
                <div className="admin-report-bar-label">
                  <span>
                    {event.event}{" "}
                    <small>({event.category})</small>
                  </span>

                  <strong>
                    {event.registrations}
                  </strong>
                </div>

                <div className="admin-report-bar-track">
                  <div
                    className="admin-report-bar-fill"
                    style={{
                      width: `${
                        event.registrations > 0
                          ? Math.min(
                              event.registrations * 10,
                              100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <div className="admin-report-bar-label">
                  <span>Attendance</span>

                  <strong>
                    {event.attendance} /{" "}
                    {event.registrations}
                  </strong>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Feedback summary */}

      <div className="admin-report-panel admin-feedback-report">
        <div className="admin-report-panel-header">
          <div>
            <h2>Feedback Summary</h2>
            <p>
              Overall participant satisfaction based on submitted reviews.
            </p>
          </div>

          <Star size={20} />
        </div>

        <div className="admin-rating-summary">
          <div className="admin-rating-number">
            <strong>
              {report?.average_rating ?? 0}
            </strong>

            <div className="admin-rating-stars">
              {"★".repeat(
                Math.round(report?.average_rating ?? 0)
              )}
              {"☆".repeat(
                5 -
                  Math.round(
                    report?.average_rating ?? 0
                  )
              )}
            </div>

            <span>Average rating out of 5</span>
          </div>

          <div className="admin-rating-bars">
            <div>
              <span>Reviews</span>

              <div>
                <i
                  style={{
                    width:
                      report?.review_count > 0
                        ? "100%"
                        : "0%",
                  }}
                />
              </div>

              <strong>
                {report?.review_count ?? 0}
              </strong>
            </div>

            <div>
              <span>Average rating</span>

              <div>
                <i
                  style={{
                    width: `${
                      ((report?.average_rating ?? 0) /
                        5) *
                      100
                    }%`,
                  }}
                />
              </div>

              <strong>
                {report?.average_rating ?? 0}/5
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Report information */}

      <div className="admin-report-panel">
        <div className="admin-report-panel-header">
          <div>
            <h2>Report Information</h2>
            <p>
              Values shown here are calculated from the current database.
            </p>
          </div>

          <Clock size={20} />
        </div>

        <p>
          This report uses live event, registration, attendance and
          feedback data from the backend.
        </p>
      </div>
    </div>
  );
}

export default AdminReports;