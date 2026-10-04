import { useEffect, useState } from "react";
import { CalendarDays, Users, UserCheck, Star, TrendingUp, Download } from "lucide-react";
import { getReports } from "../api";
import { downloadCsv, errorMessage } from "../utils";

function Reports() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { getReports().then(setReport).catch((e) => setError(errorMessage(e))); }, []);

  const exportReport = () => {
    if (!report) return;
    downloadCsv("event-performance.csv", report.event_performance || []);
  };

  const total = report?.registered || 0;
  const attendanceRate = report?.attendance_rate || 0;

  return (
    <section className="page-content">
      <div className="page-heading"><div><p className="welcome-text">College Events</p><h1>Reports</h1><p className="page-description">Analyze event performance, registrations, and attendance.</p></div><button className="primary-button" type="button" onClick={exportReport}><Download size={17} /> Download Report</button></div>
      {error && <p className="page-description">Unable to load report: {error}</p>}

      <div className="report-stats">
        <div className="report-stat-card"><div className="report-stat-icon blue"><CalendarDays size={20} /></div><div><p>Total Events</p><h2>{report?.total_events ?? 0}</h2><span className="report-change positive">Live database</span></div></div>
        <div className="report-stat-card"><div className="report-stat-icon green"><Users size={20} /></div><div><p>Total Registrations</p><h2>{report?.total_registrations ?? 0}</h2><span className="report-change positive">Live database</span></div></div>
        <div className="report-stat-card"><div className="report-stat-icon purple"><UserCheck size={20} /></div><div><p>Attendance Rate</p><h2>{attendanceRate}%</h2><span className="report-change positive">{report?.total_attendance ?? 0} checked in</span></div></div>
        <div className="report-stat-card"><div className="report-stat-icon orange"><Star size={20} /></div><div><p>Average Rating</p><h2>{report?.average_rating ?? 0}</h2><span className="report-change positive">{report?.review_count ?? 0} reviews</span></div></div>
      </div>

      <div className="reports-grid">
        <div className="report-card"><div className="report-card-header"><div><h2>Registration Overview</h2><p>Current registration status.</p></div></div><div className="report-overview-list">
          <div><span>Total</span><strong>{report?.total_registrations ?? 0}</strong></div><div><span>Registered</span><strong>{report?.registered ?? 0}</strong></div><div><span>Waitlisted</span><strong>{report?.waitlisted ?? 0}</strong></div><div><span>Cancelled</span><strong>{report?.cancelled ?? 0}</strong></div><div><span>No-shows</span><strong>{report?.no_shows ?? 0}</strong></div>
        </div></div>

        <div className="report-card"><div className="report-card-header"><div><h2>Attendance</h2><p>Registered participants who checked in.</p></div></div><div className="attendance-content"><div className="attendance-chart"><div className="attendance-center"><strong>{attendanceRate}%</strong><span>Attendance</span></div></div><div className="attendance-legend"><div><span className="legend-dot checked"></span><span>Checked In</span><strong>{report?.total_attendance ?? 0}</strong></div><div><span className="legend-dot pending"></span><span>Not Checked In / No-show</span><strong>{Math.max(total + (report?.no_shows || 0) - (report?.total_attendance || 0), 0)}</strong></div></div></div></div>

        <div className="report-card"><div className="report-card-header"><div><h2>Feedback Themes</h2><p>Average ratings across categories.</p></div></div><div className="report-overview-list">
          <div><span>Event Content</span><strong>{report?.feedback_themes?.content ?? 0} / 5</strong></div><div><span>Venue Quality</span><strong>{report?.feedback_themes?.venue ?? 0} / 5</strong></div><div><span>Value for Money</span><strong>{report?.feedback_themes?.value ?? 0} / 5</strong></div><div><span>Organization</span><strong>{report?.feedback_themes?.organization ?? 0} / 5</strong></div>
        </div></div>
      </div>

      <div className="report-card event-performance"><div className="report-card-header"><div><h2>Event Performance</h2><p>Registration and attendance performance by event.</p></div></div><div className="performance-list">
        {(report?.event_performance || []).map((event) => <div className="performance-row" key={event.event_id}><div className="performance-event"><strong>{event.event}</strong><span>{event.category}</span></div><div className="performance-number"><span>Registrations</span><strong>{event.registrations}</strong></div><div className="performance-number"><span>Attendance</span><strong>{event.attendance}</strong></div><div className="performance-number"><span>No-shows</span><strong>{event.no_shows} ({event.no_show_rate}%)</strong></div><div className="performance-progress"><div className="performance-progress-track"><div className="performance-progress-fill" style={{ width: `${event.attendance_rate}%` }}></div></div><span>{event.attendance_rate}%</span></div></div>)}
      </div></div>
    </section>
  );
}

export default Reports;
