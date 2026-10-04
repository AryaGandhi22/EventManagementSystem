
import { useEffect, useState } from "react";

import {
  Search,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Eye,
  X,
} from "lucide-react";

import { getVenues } from "../api";

function AdminVenues() {
  const [venues, setVenues] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openMenu, setOpenMenu] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);

  const loadVenues = async (searchValue = "") => {
    setLoading(true);
    setError("");

    try {
      const data = await getVenues({
        search: searchValue,
      });

      setVenues(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load venues:", e);

      setError(
        e?.data?.detail ||
          e?.message ||
          "Unable to load venues."
      );

      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVenues();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;

    setSearch(value);
    loadVenues(value);
  };

  const formatAmenities = (amenities) => {
    if (Array.isArray(amenities)) {
      return amenities.length
        ? amenities.join(", ")
        : "No amenities";
    }

    return amenities || "No amenities";
  };

  const handleMenuClick = (venueId) => {
    setOpenMenu((current) =>
      current === venueId ? null : venueId
    );
  };

  const handleViewDetails = (venue) => {
    setSelectedVenue(venue);
    setOpenMenu(null);
  };

  const closeModal = () => {
    setSelectedVenue(null);
  };

  return (
    <div
      className="admin-dashboard"
      onClick={() => setOpenMenu(null)}
    >
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
            value={search}
            onChange={handleSearch}
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

        {error && (
          <div className="admin-error-message">
            {error}
          </div>
        )}

        <div className="admin-venues-table">
          <div className="admin-venues-heading">
            <span>Venue</span>
            <span>Capacity</span>
            <span>Amenities</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div className="admin-users-empty">
              Loading venues...
            </div>
          ) : venues.length === 0 ? (
            <div className="admin-users-empty">
              No venues found.
            </div>
          ) : (
            venues.map((venue) => {
              const isAvailable = venue.is_available;

              return (
                <div
                  className="admin-venues-row"
                  key={venue.id || venue.name}
                >
                  <div className="admin-venue-info">
                    <div className="admin-venue-icon">
                      <MapPin size={18} />
                    </div>

                    <div>
                      <strong>
                        {venue.name || "Unnamed Venue"}
                      </strong>

                      <span>
                        {venue.location ||
                          "No location"}
                      </span>
                    </div>
                  </div>

                  <div className="admin-venue-capacity">
                    <Users size={15} />

                    <span>
                      {venue.capacity ?? 0}
                    </span>
                  </div>

                  <span className="admin-venue-amenities">
                    {formatAmenities(
                      venue.amenities
                    )}
                  </span>

                  <span
                    className={`admin-venue-status ${
                      isAvailable
                        ? "available"
                        : "booked"
                    }`}
                  >
                    {isAvailable ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <XCircle size={14} />
                    )}

                    {isAvailable
                      ? "Available"
                      : "Booked"}
                  </span>

                  <div
                    className="admin-user-actions"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >
                    <div className="admin-user-menu-wrapper">
                      <button
                        type="button"
                        title="More options"
                        onClick={() =>
                          handleMenuClick(
                            venue.id
                          )
                        }
                      >
                        <MoreVertical size={17} />
                      </button>

                      {openMenu === venue.id && (
                        <div className="admin-user-dropdown">
                          <button
                            type="button"
                            onClick={() =>
                              handleViewDetails(
                                venue
                              )
                            }
                          >
                            <Eye size={16} />
                            <span>
                              View Details
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* VENUE DETAILS MODAL */}
      {selectedVenue && (
        <div
          className="admin-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="admin-user-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="admin-modal-header">
              <div>
                <h2>Venue Details</h2>

                <p>
                  View complete venue information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="admin-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-user-details">
              <div className="admin-detail-avatar">
                <MapPin size={24} />
              </div>

              <div className="admin-detail-item">
                <label>Venue</label>

                <strong>
                  {selectedVenue.name ||
                    "Unnamed Venue"}
                </strong>
              </div>

              <div className="admin-detail-item">
                <label>Location</label>

                <strong>
                  {selectedVenue.location ||
                    "No location"}
                </strong>
              </div>

              <div className="admin-detail-item">
                <label>Capacity</label>

                <strong>
                  {selectedVenue.capacity ??
                    0}
                </strong>
              </div>

              <div className="admin-detail-item">
                <label>Status</label>

                <strong
                  className={
                    selectedVenue.is_available
                      ? "admin-detail-active"
                      : "admin-detail-inactive"
                  }
                >
                  {selectedVenue.is_available
                    ? "Available"
                    : "Booked"}
                </strong>
              </div>

              <div className="admin-detail-item">
                <label>Amenities</label>

                <strong>
                  {formatAmenities(
                    selectedVenue.amenities
                  )}
                </strong>
              </div>

              <div className="admin-detail-item">
                <label>Description</label>

                <strong>
                  {selectedVenue.description ||
                    "No description available."}
                </strong>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={closeModal}
                className="admin-modal-cancel"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminVenues;