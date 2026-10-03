import {
  Search,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  MoreVertical,
} from "lucide-react";

function AdminVenues() {
  const venues = [
    {
      name: "Main Auditorium",
      location: "Block A",
      capacity: "500",
      amenities: "Projector, Sound System",
      status: "Available",
    },
    {
      name: "Seminar Hall",
      location: "Block B",
      capacity: "200",
      amenities: "Projector, AC",
      status: "Available",
    },
    {
      name: "Sports Ground",
      location: "College Campus",
      capacity: "1000",
      amenities: "Lighting, Seating",
      status: "Booked",
    },
    {
      name: "Computer Lab 1",
      location: "Block C",
      capacity: "80",
      amenities: "Computers, Projector",
      status: "Available",
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <h1>Venue Management</h1>
          <p className="page-description">
            Manage venues, capacity and availability.
          </p>
        </div>
      </div>

      <div className="admin-user-toolbar">
        <div className="admin-user-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search venues..."
          />
        </div>
      </div>

      <div className="admin-table-panel">
        <div className="admin-table-header">
          <div>
            <h2>All Venues</h2>
            <p>
              View and manage available college venues.
            </p>
          </div>
        </div>

        <div className="admin-venues-table">
          <div className="admin-venues-heading">
            <span>Venue</span>
            <span>Capacity</span>
            <span>Amenities</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {venues.map((venue) => (
            <div
              className="admin-venues-row"
              key={venue.name}
            >
              <div className="admin-venue-info">
                <div className="admin-venue-icon">
                  <MapPin size={18} />
                </div>

                <div>
                  <strong>{venue.name}</strong>
                  <span>{venue.location}</span>
                </div>
              </div>

              <div className="admin-venue-capacity">
                <Users size={15} />
                <span>{venue.capacity}</span>
              </div>

              <span className="admin-venue-amenities">
                {venue.amenities}
              </span>

              <span
                className={`admin-venue-status ${
                  venue.status === "Available"
                    ? "available"
                    : "booked"
                }`}
              >
                {venue.status === "Available" ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <XCircle size={14} />
                )}

                {venue.status}
              </span>

              <div className="admin-user-actions">
                <button
                  type="button"
                  title="More options"
                >
                  <MoreVertical size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminVenues;