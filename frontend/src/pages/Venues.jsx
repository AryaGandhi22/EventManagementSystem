import { useEffect, useMemo, useState } from "react";
import { Plus, Search, MapPin, Users, CalendarDays, MoreVertical } from "lucide-react";
import { createVenue, deleteVenue, getVenues } from "../api";
import { errorMessage } from "../utils";

function Venues() {
  const [venues, setVenues] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    try { setVenues(await getVenues()); setError(""); }
    catch (e) { setError(errorMessage(e)); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => venues.filter((v) => {
    const q = search.toLowerCase();
    return (!q || `${v.name} ${v.location} ${v.description}`.toLowerCase().includes(q)) && (filter === "all" || (filter === "available" ? v.is_available : !v.is_available));
  }), [venues, search, filter]);

  const addVenue = async () => {
    try {
      const name = window.prompt("Venue name:"); if (!name) return;
      const location = window.prompt("Location:") || "College Campus";
      const capacity = Number(window.prompt("Capacity:", "100")); if (!capacity) return;
      const description = window.prompt("Description:") || "";
      const amenities = (window.prompt("Amenities, comma separated:", "Projector, Wi-Fi") || "").split(",").map((x) => x.trim()).filter(Boolean);
      await createVenue({ name, location, capacity, description, amenities, is_available: true });
      setMessage("Venue created successfully."); await load();
    } catch (e) { setError(errorMessage(e)); }
  };

  const removeVenue = async (venue) => {
    if (!window.confirm(`Delete ${venue.name}?`)) return;
    try { await deleteVenue(venue.id); setMessage("Venue deleted."); await load(); }
    catch (e) { setError(errorMessage(e)); }
  };

  const totalCapacity = venues.reduce((sum, v) => sum + Number(v.capacity || 0), 0);

  return (
    <section className="page-content">
      <div className="page-heading"><div><p className="welcome-text">College Events</p><h1>Venues</h1><p className="page-description">Manage college venues, capacity, facilities, and bookings.</p></div><button className="primary-button" type="button" onClick={addVenue}><Plus size={17} /> Add Venue</button></div>
      {message && <p className="page-description">{message}</p>}{error && <p className="page-description">{error}</p>}

      <div className="venue-stats">
        <div className="venue-stat-card"><div className="venue-stat-icon blue"><MapPin size={20} /></div><div><p>Total Venues</p><h2>{venues.length}</h2></div></div>
        <div className="venue-stat-card"><div className="venue-stat-icon green"><CalendarDays size={20} /></div><div><p>Available</p><h2>{venues.filter((v) => v.is_available).length}</h2></div></div>
        <div className="venue-stat-card"><div className="venue-stat-icon orange"><CalendarDays size={20} /></div><div><p>Currently Booked</p><h2>{venues.filter((v) => !v.is_available).length}</h2></div></div>
        <div className="venue-stat-card"><div className="venue-stat-icon purple"><Users size={20} /></div><div><p>Total Capacity</p><h2>{totalCapacity.toLocaleString()}</h2></div></div>
      </div>

      <div className="venues-card">
        <div className="venues-header"><div><h2>Venue Directory</h2><p>View and manage available college venues.</p></div><div className="venue-filters"><div className="venue-search"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search venues..." /></div><select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All Venues</option><option value="available">Available</option><option value="booked">Booked</option></select></div></div>
        <div className="venues-grid">
          {filtered.map((venue, index) => <div className="venue-card" key={venue.id}>
            <div className="venue-card-top"><div className={`venue-icon ${["blue", "green", "orange", "purple"][index % 4]}`}><MapPin size={20} /></div><button className="icon-button" type="button" title="Delete venue" onClick={() => removeVenue(venue)}><MoreVertical size={18} /></button></div>
            <div className="venue-card-content"><h3>{venue.name}</h3><p>{venue.description || venue.location}</p><div className="venue-details"><span><Users size={14} />{venue.capacity.toLocaleString()} Capacity</span><span className={venue.is_available ? "" : "booked-status"}><CalendarDays size={14} />{venue.is_available ? "Available" : "Booked"}</span></div><div className="venue-amenities">{(venue.amenities || []).slice(0, 4).map((a) => <span key={a}>{a}</span>)}</div></div>
            <button className="venue-view-button" type="button" onClick={() => window.alert(`${venue.name}\nLocation: ${venue.location}\nCapacity: ${venue.capacity}\nStatus: ${venue.is_available ? "Available" : "Booked"}`)}>View Details</button>
          </div>)}
        </div>
      </div>
    </section>
  );
}

export default Venues;
