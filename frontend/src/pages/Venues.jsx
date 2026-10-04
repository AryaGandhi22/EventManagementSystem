import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  MapPin,
  Users,
  CalendarDays,
  MoreVertical,
  X,
} from "lucide-react";

import { createVenue, deleteVenue, getVenues } from "../api";
import { errorMessage } from "../utils";

function Venues() {
  const [venues, setVenues] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Modal state
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);

  // Venue form
  const [venueForm, setVenueForm] = useState({
    name: "",
    location: "",
    capacity: "",
    description: "",
    amenities: "",
  });

  // Load venues from backend
  const load = async () => {
    try {
      const data = await getVenues();
      setVenues(data);
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filter venues
  const filtered = useMemo(
    () =>
      venues.filter((v) => {
        const q = search.toLowerCase();

        return (
          (!q ||
            `${v.name} ${v.location} ${v.description}`
              .toLowerCase()
              .includes(q)) &&
          (filter === "all" ||
            (filter === "available"
              ? v.is_available
              : !v.is_available))
        );
      }),
    [venues, search, filter]
  );

  // Open modal
  const openVenueModal = () => {
    setError("");
    setMessage("");

    setVenueForm({
      name: "",
      location: "",
      capacity: "",
      description: "",
      amenities: "",
    });

    setShowVenueModal(true);
  };

  const openVenueDetails = (venue) => {
    setSelectedVenue(venue);
  };

  // Close modal
  const closeVenueModal = () => {
    setShowVenueModal(false);
  };

  const closeVenueDetails = () => {
    setSelectedVenue(null);
  };

  // Create venue through backend
  const handleCreateVenue = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const capacity = Number(venueForm.capacity);

    if (!venueForm.name.trim()) {
      setError("Venue name is required.");
      return;
    }

    if (!capacity || capacity <= 0) {
      setError("Capacity must be greater than 0.");
      return;
    }

    try {
      const amenities = venueForm.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const payload = new FormData();
      payload.append("name", venueForm.name.trim());
      payload.append("location", venueForm.location.trim());
      payload.append("capacity", capacity);
      payload.append("description", venueForm.description.trim());
      // Append amenities as a JSON string
      payload.append("amenities", JSON.stringify(amenities));
      payload.append("is_available", true);
      
      if (venueForm.image) {
        payload.append("image", venueForm.image);
      }

      await createVenue(payload);

      setMessage("Venue created successfully.");

      setVenueForm({
        name: "",
        location: "",
        capacity: "",
        description: "",
        amenities: "",
      });

      setShowVenueModal(false);

      // Reload data from backend
      await load();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  // Delete venue
  const removeVenue = async (venue) => {
    const confirmed = window.confirm(`Delete ${venue.name}?`);

    if (!confirmed) return;

    try {
      await deleteVenue(venue.id);
      setMessage("Venue deleted.");
      setError("");

      await load();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const totalCapacity = venues.reduce(
    (sum, v) => sum + Number(v.capacity || 0),
    0
  );

  return (
    <section className="page-content">

      {/* PAGE HEADER */}
      <div className="page-heading">
        <div>
          <p className="welcome-text">College Events</p>

          <h1>Venues</h1>

          <p className="page-description">
            Manage college venues, capacity, facilities, and bookings.
          </p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={openVenueModal}
        >
          <Plus size={17} />
          Add Venue
        </button>
      </div>

      {/* MESSAGES */}
      {message && (
        <p className="page-description success-message">
          {message}
        </p>
      )}

      {error && (
        <p className="page-description error-message">
          {error}
        </p>
      )}

      {/* STATS */}
      <div className="venue-stats">

        <div className="venue-stat-card">
          <div className="venue-stat-icon blue">
            <MapPin size={20} />
          </div>

          <div>
            <p>Total Venues</p>
            <h2>{venues.length}</h2>
          </div>
        </div>

        <div className="venue-stat-card">
          <div className="venue-stat-icon green">
            <CalendarDays size={20} />
          </div>

          <div>
            <p>Available</p>
            <h2>
              {venues.filter((v) => v.is_available).length}
            </h2>
          </div>
        </div>

        <div className="venue-stat-card">
          <div className="venue-stat-icon orange">
            <CalendarDays size={20} />
          </div>

          <div>
            <p>Currently Booked</p>
            <h2>
              {venues.filter((v) => !v.is_available).length}
            </h2>
          </div>
        </div>

        <div className="venue-stat-card">
          <div className="venue-stat-icon purple">
            <Users size={20} />
          </div>

          <div>
            <p>Total Capacity</p>
            <h2>{totalCapacity.toLocaleString()}</h2>
          </div>
        </div>

      </div>

      {/* VENUE DIRECTORY */}
      <div className="venues-card">

        <div className="venues-header">

          <div>
            <h2>Venue Directory</h2>

            <p>
              View and manage available college venues.
            </p>
          </div>

          <div className="venue-filters">

            <div className="venue-search">
              <Search size={16} />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search venues..."
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Venues</option>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
            </select>

          </div>

        </div>

        {/* VENUE CARDS */}
        <div className="venues-grid">

          {filtered.map((venue, index) => (

            <div
              className="venue-card"
              key={venue.id}
            >

              {venue.image && (
                <div style={{ width: '100%', height: '140px', overflow: 'hidden', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                  <img src={venue.image} alt={venue.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div className="venue-card-top" style={{ paddingTop: venue.image ? '16px' : '24px' }}>

                <div
                  className={`venue-icon ${
                    ["blue", "green", "orange", "purple"][
                      index % 4
                    ]
                  }`}
                >
                  <MapPin size={20} />
                </div>

                <button
                  className="icon-button"
                  type="button"
                  title="Delete venue"
                  onClick={() => removeVenue(venue)}
                >
                  <MoreVertical size={18} />
                </button>

              </div>

              <div className="venue-card-content">

                <h3>{venue.name}</h3>

                <p>
                  {venue.description || venue.location}
                </p>

                <div className="venue-details">

                  <span>
                    <Users size={14} />

                    {Number(
                      venue.capacity || 0
                    ).toLocaleString()}{" "}
                    Capacity
                  </span>

                  <span
                    className={
                      venue.is_available
                        ? ""
                        : "booked-status"
                    }
                  >
                    <CalendarDays size={14} />

                    {venue.is_available
                      ? "Available"
                      : "Booked"}
                  </span>

                </div>

                <div className="venue-amenities">

                  {(venue.amenities || [])
                    .slice(0, 4)
                    .map((a) => (
                      <span key={a}>
                        {a}
                      </span>
                    ))}

                </div>

              </div>

              <button
  className="venue-view-button"
  type="button"
  onClick={() => openVenueDetails(venue)}
>
  View Details
</button>

            </div>

          ))}

        </div>

      </div>

      {/* ============================= */}
      {/* ADD VENUE MODAL */}
      {/* ============================= */}

      {showVenueModal && (

        <div
          className="modal-overlay"
          onClick={closeVenueModal}
        >

          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}
            <div className="modal-header">

              <div>
                <h2>Add New Venue</h2>

                <p>
                  Enter the venue details below.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeVenueModal}
              >
                <X size={22} />
              </button>

            </div>

            {/* FORM */}
            <form onSubmit={handleCreateVenue}>

              {/* VENUE NAME */}
              <div className="form-group">

                <label>
                  Venue name *
                </label>

                <input
                  type="text"
                  placeholder="Enter venue name"
                  value={venueForm.name}
                  onChange={(e) =>
                    setVenueForm({
                      ...venueForm,
                      name: e.target.value,
                    })
                  }
                  required
                />

              </div>

              {/* DESCRIPTION */}
              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  placeholder="Describe your venue"
                  value={venueForm.description}
                  onChange={(e) =>
                    setVenueForm({
                      ...venueForm,
                      description: e.target.value,
                    })
                  }
                />

              </div>

              {/* CAPACITY + LOCATION */}
              <div className="form-row">

                <div className="form-group">

                  <label>
                    Capacity *
                  </label>

                  <input
                    type="number"
                    min="1"
                    placeholder="500"
                    value={venueForm.capacity}
                    onChange={(e) =>
                      setVenueForm({
                        ...venueForm,
                        capacity: e.target.value,
                      })
                    }
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    placeholder="Enter location"
                    value={venueForm.location}
                    onChange={(e) =>
                      setVenueForm({
                        ...venueForm,
                        location: e.target.value,
                      })
                    }
                  />

                </div>

              </div>

              {/* AMENITIES */}
              <div className="form-group">

                <label>
                  Amenities
                </label>

                <input
                  type="text"
                  placeholder="Projector, Wi-Fi, AC"
                  value={venueForm.amenities}
                  onChange={(e) =>
                    setVenueForm({
                      ...venueForm,
                      amenities: e.target.value,
                    })
                  }
                />

                <small>
                  Separate amenities with commas.
                </small>

              </div>

              {/* IMAGE */}
              <div className="form-group">
                <label>Venue Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setVenueForm({
                      ...venueForm,
                      image: e.target.files[0],
                    })
                  }
                />
              </div>

              {/* BUTTONS */}
              <div className="modal-actions">

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeVenueModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                >
                  Add Venue
                </button>

              </div>

            </form>

          </div>

        </div>

            )}

      {/* ============================= */}
      {/* VIEW VENUE DETAILS MODAL */}
      {/* ============================= */}

      {selectedVenue && (
        <div
          className="modal-overlay"
          onClick={closeVenueDetails}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}
            <div className="modal-header">

              <div>
                <h2>{selectedVenue.name}</h2>

                <p>
                  Venue details and availability information.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeVenueDetails}
              >
                <X size={22} />
              </button>

            </div>

            {/* VENUE DETAILS */}
            <div className="venue-details-modal">

              <div className="venue-detail-item">
                <span className="venue-detail-label">
                  Venue Name
                </span>

                <span className="venue-detail-value">
                  {selectedVenue.name}
                </span>
              </div>

              <div className="venue-detail-item">
                <span className="venue-detail-label">
                  Location
                </span>

                <span className="venue-detail-value">
                  {selectedVenue.location || "Not specified"}
                </span>
              </div>

              <div className="venue-detail-item">
                <span className="venue-detail-label">
                  Capacity
                </span>

                <span className="venue-detail-value">
                  {Number(
                    selectedVenue.capacity || 0
                  ).toLocaleString()}{" "}
                  people
                </span>
              </div>

              <div className="venue-detail-item">
                <span className="venue-detail-label">
                  Status
                </span>

                <span
                  className={`venue-status-badge ${
                    selectedVenue.is_available
                      ? "available"
                      : "booked"
                  }`}
                >
                  {selectedVenue.is_available
                    ? "Available"
                    : "Booked"}
                </span>
              </div>

              {/* DESCRIPTION */}
              <div className="venue-detail-description">

                <span className="venue-detail-label">
                  Description
                </span>

                <p>
                  {selectedVenue.description ||
                    "No description provided."}
                </p>

              </div>

              {/* AMENITIES */}
              <div className="venue-detail-description">

                <span className="venue-detail-label">
                  Amenities
                </span>

                <div className="venue-detail-amenities">

                  {(selectedVenue.amenities || []).length > 0 ? (
                    selectedVenue.amenities.map((amenity) => (
                      <span key={amenity}>
                        {amenity}
                      </span>
                    ))
                  ) : (
                    <p>No amenities specified.</p>
                  )}

                </div>

              </div>

            </div>

            {/* FOOTER */}
            <div className="modal-actions">

              <button
                type="button"
                className="btn-secondary"
                onClick={closeVenueDetails}
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

    </section>
  );
}

export default Venues;