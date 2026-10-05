import { useEffect, useMemo, useState } from "react";
import { Plus, Search, MoreVertical, Users, UserCheck, CalendarCheck, UserPlus } from "lucide-react";
import { getParticipants, registerUser } from "../api";
import { errorMessage, formatDate, initials } from "../utils";

function Participants() {
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    try { setParticipants(await getParticipants()); setError(""); }
    catch (e) { setError(errorMessage(e)); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => participants.filter((p) => {
    const q = search.toLowerCase();
    const eventTitles = (p.registered_events || []).map(e => e.title || "").join(" ");
    const text = `${p.name || ""} ${p.username || ""} ${p.email || ""} ${eventTitles}`.toLowerCase();
    return (!q || text.includes(q)) && (status === "all" || p.status === status);
  }), [participants, search, status]);

  const attended = participants.reduce((sum, p) => sum + (p.events_attended || 0), 0);

  const addParticipant = async () => {
    try {
      const username = window.prompt("Username:"); if (!username) return;
      const email = window.prompt("Email:"); if (!email) return;
      const first_name = window.prompt("First name:") || "";
      const last_name = window.prompt("Last name:") || "";
      const password = window.prompt("Temporary password (min 8 characters):", "Student@123"); if (!password) return;
      await registerUser({ username, email, first_name, last_name, password });
      setMessage("Participant account created successfully.");
      await load();
    } catch (e) { setError(errorMessage(e)); }
  };

  return (
    <section className="page-content">
      <div className="page-heading"><div><p className="welcome-text">College Events</p><h1>Participants</h1><p className="page-description">Manage participant profiles, interests, and event activity.</p></div><button className="primary-button" type="button" onClick={addParticipant}><Plus size={17} /> Add Participant</button></div>
      {message && <p className="page-description">{message}</p>}{error && <p className="page-description">{error}</p>}

      <div className="participant-stats">
        <div className="participant-stat-card"><div className="participant-stat-icon blue"><Users size={20} /></div><div><p>Total Participants</p><h2>{participants.length}</h2></div></div>
        <div className="participant-stat-card"><div className="participant-stat-icon green"><UserCheck size={20} /></div><div><p>Active Participants</p><h2>{participants.filter((p) => p.status === "active").length}</h2></div></div>
        <div className="participant-stat-card"><div className="participant-stat-icon purple"><CalendarCheck size={20} /></div><div><p>Events Attended</p><h2>{attended}</h2></div></div>
        <div className="participant-stat-card"><div className="participant-stat-icon orange"><UserPlus size={20} /></div><div><p>New Participants</p><h2>{participants.filter((p) => p.last_activity && new Date(p.last_activity) > new Date(Date.now() - 30 * 86400000)).length}</h2></div></div>
      </div>

      <div className="participants-card">
        <div className="participants-header"><div><h2>Participant Directory</h2><p>Manage participant profiles and account information.</p></div><div className="participant-filters"><div className="participant-search"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search participants or events..." /></div><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select></div></div>
        <div className="participant-table-wrapper"><table className="participant-table"><thead><tr><th>Participant</th><th>Phone</th><th>Registered Events</th><th>Events Attended</th><th>Last Activity</th><th>Status</th><th></th></tr></thead><tbody>
          {filtered.length === 0 ? <tr><td colSpan="7">No participants found.</td></tr> : filtered.map((p) => <tr key={p.id}>
            <td><div className="participant-info"><div className="participant-avatar">{initials(p.name)}</div><div><strong>{p.name || p.username}</strong><span>{p.email || ""}</span></div></div></td>
            <td>{p.phone || "—"}</td>
            <td>
              {(p.registered_events || []).length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {p.registered_events.map((ev, i) => (
                    <span
                      key={ev.id || i}
                      className="interest-tag"
                      style={{
                        background: ev.checked_in ? "#dcfce7" : "#e0e7ff",
                        color: ev.checked_in ? "#15803d" : "#4338ca",
                        fontWeight: 500,
                        fontSize: "12px",
                        padding: "2px 8px",
                        borderRadius: "12px"
                      }}
                    >
                      {ev.title} {ev.checked_in ? "✓" : ""}
                    </span>
                  ))}
                </div>
              ) : (
                "—"
              )}
            </td>
            <td>{p.events_attended || 0}</td>
            <td>{formatDate(p.last_activity)}</td>
            <td><span className={`participant-status ${p.status}`}>{p.status === "active" ? "Active" : "Inactive"}</span></td><td><button className="table-action" type="button"><MoreVertical size={17} /></button></td>
          </tr>)}
        </tbody></table></div>
      </div>
    </section>
  );
}

export default Participants;
