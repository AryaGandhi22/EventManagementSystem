import { useEffect, useState } from "react";
import { CalendarDays, Users, UserCheck, Star, Download, Eye, DollarSign, MessageSquare, Send } from "lucide-react";
import { getReports, api, replyToFeedback } from "../api";
import { downloadCsv, errorMessage } from "../utils";

function Reports() {
  const [report, setReport] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState("");
  const [replyText, setReplyText] = useState({});
  const [replyingId, setReplyingId] = useState(null);

  const loadData = async () => {
    try {
      const rep = await getReports();
      setReport(rep);
      const fb = await api("/feedback/");
      setFeedbacks(Array.isArray(fb) ? fb : fb.results || []);
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const exportReport = () => {
    if (!report) return;
    downloadCsv("event-performance.csv", report.event_performance || []);
  };

  const handleSendReply = async (feedbackId) => {
    const text = replyText[feedbackId];
    if (!text || !text.trim()) return;
    setReplyingId(feedbackId);
    try {
      await replyToFeedback(feedbackId, text.trim());
      setReplyText((prev) => ({ ...prev, [feedbackId]: "" }));
      await loadData();
    } catch (e) {
      alert(errorMessage(e) || "Failed to post reply.");
    } finally {
      setReplyingId(null);
    }
  };

  const total = report?.registered || 0;
  const attendanceRate = report?.attendance_rate || 0;

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="welcome-text">College Events</p>
          <h1>Reports & Analytics</h1>
          <p className="page-description">Analyze event performance, budget, views, registrations, and attendee feedback.</p>
        </div>
        <button className="primary-button" type="button" onClick={exportReport}>
          <Download size={17} /> Download Report
        </button>
      </div>

      {error && <p className="page-description" style={{ color: "#ef4444" }}>Unable to load report: {error}</p>}

      <div className="report-stats">
        <div className="report-stat-card">
          <div className="report-stat-icon blue"><CalendarDays size={20} /></div>
          <div>
            <p>Total Events</p>
            <h2>{report?.total_events ?? 0}</h2>
            <span className="report-change positive">Live database</span>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon green"><Users size={20} /></div>
          <div>
            <p>Total Registrations</p>
            <h2>{report?.total_registrations ?? 0}</h2>
            <span className="report-change positive">Live database</span>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon purple"><UserCheck size={20} /></div>
          <div>
            <p>Attendance Rate</p>
            <h2>{attendanceRate}%</h2>
            <span className="report-change positive">{report?.total_attendance ?? 0} checked in</span>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon orange"><Star size={20} /></div>
          <div>
            <p>Average Rating</p>
            <h2>{report?.average_rating ?? 0}</h2>
            <span className="report-change positive">{report?.review_count ?? 0} reviews</span>
          </div>
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <div className="report-card-header">
            <div>
              <h2>Registration Overview</h2>
              <p>Current registration status breakdown.</p>
            </div>
          </div>
          <div className="report-overview-list">
            <div><span>Total Registrations</span><strong>{report?.total_registrations ?? 0}</strong></div>
            <div><span>Active Registrations</span><strong>{report?.registered ?? 0}</strong></div>
            <div><span>Waitlisted</span><strong>{report?.waitlisted ?? 0}</strong></div>
            <div><span>Cancelled</span><strong>{report?.cancelled ?? 0}</strong></div>
            <div><span>No-shows</span><strong>{report?.no_shows ?? 0}</strong></div>
          </div>
        </div>

        <div className="report-card">
          <div className="report-card-header">
            <div>
              <h2>Attendance</h2>
              <p>Registered participants who checked in.</p>
            </div>
          </div>
          <div className="attendance-content">
            <div className="attendance-chart">
              <div className="attendance-center">
                <strong>{attendanceRate}%</strong>
                <span>Attendance</span>
              </div>
            </div>
            <div className="attendance-legend">
              <div><span className="legend-dot checked"></span><span>Checked In</span><strong>{report?.total_attendance ?? 0}</strong></div>
              <div><span className="legend-dot pending"></span><span>Not Checked In / No-show</span><strong>{Math.max(total + (report?.no_shows || 0) - (report?.total_attendance || 0), 0)}</strong></div>
            </div>
          </div>
        </div>

        <div className="report-card">
          <div className="report-card-header">
            <div>
              <h2>Feedback Themes</h2>
              <p>Average ratings across categories.</p>
            </div>
          </div>
          <div className="report-overview-list">
            <div><span>Event Content</span><strong>{report?.feedback_themes?.content ?? 0} / 5</strong></div>
            <div><span>Venue Quality</span><strong>{report?.feedback_themes?.venue ?? 0} / 5</strong></div>
            <div><span>Value for Money</span><strong>{report?.feedback_themes?.value ?? 0} / 5</strong></div>
            <div><span>Organization</span><strong>{report?.feedback_themes?.organization ?? 0} / 5</strong></div>
          </div>
        </div>
      </div>

      {/* EVENT PERFORMANCE & PROMOTION TRACKING TABLE */}
      <div className="report-card event-performance" style={{ marginTop: 24 }}>
        <div className="report-card-header">
          <div>
            <h2>Event Performance & Promotion Analytics</h2>
            <p>Track page views, budget allocation, registrations, and attendance rates.</p>
          </div>
        </div>

        <div className="performance-list">
          {(report?.event_performance || []).map((event) => (
            <div className="performance-row" key={event.event_id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr", gap: 12, alignItems: "center" }}>
              <div className="performance-event">
                <strong>{event.event}</strong>
                <span>{event.category}</span>
              </div>

              <div className="performance-number">
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Eye size={13} /> Views</span>
                <strong>{event.views ?? 0}</strong>
              </div>

              <div className="performance-number">
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><DollarSign size={13} /> Budget</span>
                <strong>₹{Number(event.budget || 0).toLocaleString()}</strong>
              </div>

              <div className="performance-number">
                <span>Registrations</span>
                <strong>{event.registrations}</strong>
              </div>

              <div className="performance-number">
                <span>Attendance</span>
                <strong>{event.attendance}</strong>
              </div>

              <div className="performance-number">
                <span>No-shows</span>
                <strong>{event.no_shows} ({event.no_show_rate}%)</strong>
              </div>

              <div className="performance-progress">
                <div className="performance-progress-track">
                  <div className="performance-progress-fill" style={{ width: `${event.attendance_rate}%` }}></div>
                </div>
                <span>{event.attendance_rate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STUDENT FEEDBACK & ORGANIZER RESPONSES */}
      <div className="report-card" style={{ marginTop: 24 }}>
        <div className="report-card-header">
          <div>
            <h2>Student Reviews & Organizer Responses</h2>
            <p>Respond directly to attendee feedback and reviews.</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 12 }}>
          {feedbacks.length === 0 ? (
            <p className="page-description">No student feedback submitted yet.</p>
          ) : (
            feedbacks.map((fb) => (
              <div key={fb.id} style={{ padding: 16, borderRadius: 10, background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div>
                    <strong style={{ fontSize: 15, color: "#f8fafc" }}>{fb.event_details?.title || "Event Review"}</strong>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: "#94a3b8" }}>by {fb.user?.name || fb.user?.username || "Student"}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#f59e0b", fontWeight: 600 }}>
                    <Star size={16} fill="#f59e0b" /> {fb.rating} / 5
                  </div>
                </div>

                {fb.comment && (
                  <p style={{ margin: "8px 0", fontSize: 14, color: "#cbd5e1" }}>"{fb.comment}"</p>
                )}

                {/* Organizer Existing Reply */}
                {fb.organizer_reply ? (
                  <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "rgba(99, 102, 241, 0.12)", borderLeft: "3px solid #6366f1" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#818cf8" }}>
                      <MessageSquare size={14} /> Organizer Official Reply:
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#e2e8f0" }}>{fb.organizer_reply}</p>
                  </div>
                ) : (
                  <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Write an official organizer response..."
                      value={replyText[fb.id] || ""}
                      onChange={(e) => setReplyText({ ...replyText, [fb.id]: e.target.value })}
                      style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(15,23,42,0.8)", color: "#fff", fontSize: 13, outline: "none" }}
                    />
                    <button
                      type="button"
                      disabled={replyingId === fb.id}
                      onClick={() => handleSendReply(fb.id)}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 }}
                    >
                      <Send size={14} /> {replyingId === fb.id ? "Sending..." : "Reply"}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default Reports;
