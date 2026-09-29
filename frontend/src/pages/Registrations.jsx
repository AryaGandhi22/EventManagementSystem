import { useEffect, useMemo, useState } from "react";
import { Search, Download, UserCheck, Clock, XCircle, MoreVertical } from "lucide-react";
import { cancelRegistration, checkInRegistration, getRegistrations } from "../api";
import { downloadCsv, errorMessage, formatDate, initials } from "../utils";

function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setRegistrations(await getRegistrations({ all: "true" }));
      setError("");
    } catch (e) { setError(errorMessage(e)); }
  };

  useEffect(() => { load(); }, []);

  const events = [...new Map(registrations.map((r) => [r.event_details?.id, r.event_details])).values()].filter(Boolean);
  const filtered = useMemo(() => registrations.filter((r) => {
    const q = search.toLowerCase();
    const participant = `${r.user?.name || ""} ${r.user?.email || ""}`.toLowerCase();
    const matchesSearch = !q || participant.includes(q) || (r.event_details?.title || "").toLowerCase().includes(q);
    return matchesSearch && (eventFilter === "all" || r.event_details?.id === eventFilter) && (statusFilter === "all" || r.status === statusFilter);
  }), [registrations, search, eventFilter, statusFilter]);

  const counts = {
    total: registrations.length,
    registered: registrations.filter((r) => r.status === "registered").length,
    waitlisted: registrations.filter((r) => r.status === "waitlisted").length,
    cancelled: registrations.filter((r) => r.status === "cancelled").length,
  };

  const action = async (registration) => {
    const command = registration.status === "cancelled" ? "" : window.prompt(`For ${registration.user?.name || "participant"}, type CHECKIN or CANCEL:`, "CHECKIN");
    if (!command) return;
    try {
      if (command.toLowerCase() === "checkin") await checkInRegistration(registration.id);
      else if (command.toLowerCase() === "cancel") await cancelRegistration(registration.id);
      else return;
      setMessage("Registration updated successfully.");
      await load();
    } catch (e) { setError(errorMessage(e)); }
  };

  const exportData = () => downloadCsv("registrations.csv", filtered.map((r) => ({ participant: r.user?.name, email: r.user?.email, event: r.event_details?.title, date: formatDate(r.registered_at), status: r.status, checked_in: r.checked_in ? "Yes" : "No" })));

  return (
    <section className="page-content">
      <div className="page-heading"><div><p className="welcome-text">College Events</p><h1>Registrations</h1><p className="page-description">Track event registrations, attendance, and participant status.</p></div><button className="primary-button" type="button" onClick={exportData}><Download size={17} /> Export</button></div>
      {message && <p className="page-description">{message}</p>}{error && <p className="page-description">{error}</p>}

      <div className="registration-stats">
        <div className="registration-stat-card"><div className="registration-stat-icon blue"><UserCheck size={20} /></div><div><p>Total Registrations</p><h2>{counts.total}</h2></div></div>
        <div className="registration-stat-card"><div className="registration-stat-icon green"><UserCheck size={20} /></div><div><p>Registered</p><h2>{counts.registered}</h2></div></div>
        <div className="registration-stat-card"><div className="registration-stat-icon orange"><Clock size={20} /></div><div><p>Waitlisted</p><h2>{counts.waitlisted}</h2></div></div>
        <div className="registration-stat-card"><div className="registration-stat-icon red"><XCircle size={20} /></div><div><p>Cancelled</p><h2>{counts.cancelled}</h2></div></div>
      </div>

      <div className="registrations-card">
        <div className="registrations-header"><div><h2>Registration Directory</h2><p>View and manage event registrations.</p></div><div className="registration-filters">
          <div className="registration-search"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search registrations..." /></div>
          <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}><option value="all">All Events</option>{events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">All Status</option><option value="registered">Registered</option><option value="waitlisted">Waitlisted</option><option value="cancelled">Cancelled</option></select>
        </div></div>

        <div className="registration-table-wrapper"><table className="registration-table"><thead><tr><th>Participant</th><th>Event</th><th>Registration Date</th><th>Status</th><th>Check-in</th><th></th></tr></thead><tbody>
          {filtered.length === 0 ? <tr><td colSpan="6">No registrations found.</td></tr> : filtered.map((r) => <tr key={r.id}>
            <td><div className="participant-cell"><div className="participant-avatar">{initials(r.user?.name)}</div><div><strong>{r.user?.name || r.user?.username}</strong><span>{r.user?.email || ""}</span></div></div></td>
            <td>{r.event_details?.title || "—"}</td><td>{formatDate(r.registered_at)}</td>
            <td><span className={`registration-status ${r.status}`}>{r.status.replace("_", " ")}</span></td>
            <td><span className={`checkin ${r.checked_in ? "checked" : "pending"}`}>{r.checked_in ? "Checked In" : r.status === "cancelled" ? "—" : "Pending"}</span></td>
            <td><button className="table-action" type="button" onClick={() => action(r)}><MoreVertical size={17} /></button></td>
          </tr>)}
        </tbody></table></div>
      </div>
    </section>
  );
}

export default Registrations;
