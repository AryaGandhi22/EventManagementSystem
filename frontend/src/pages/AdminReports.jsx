import {
  BarChart3,
  CalendarDays,
  Users,
  MapPin,
  Star,
  TrendingUp,
} from "lucide-react";

function AdminReports() {
  const eventStats = [
    { name: "Tech Fest", registrations: 86 },
    { name: "Cultural Night", registrations: 142 },
    { name: "Sports Meet", registrations: 64 },
    { name: "AI Workshop", registrations: 58 },
  ];

  const venueStats = [
    { name: "Main Auditorium", usage: "78%" },
    { name: "Seminar Hall", usage: "64%" },
    { name: "Sports Ground", usage: "52%" },
    { name: "Computer Lab 1", usage: "41%" },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Reports</h1>
          <p>Overview of events, registrations, venues and feedback.</p>
        </div>
      </div>

      {/* Summary cards */}

      <div className="admin-report-summary">
        <div className="admin-report-card">
          <div className="admin-report-icon">
            <CalendarDays size={21} />
          </div>

          <div>
            <span>Total Events</span>
            <strong>24</strong>
            <small>
              <TrendingUp size={13} />
              12% this month
            </small>
          </div>
        </div>

        <div className="admin-report-card">
          <div className="admin-report-icon">
            <Users size={21} />
          </div>

          <div>
            <span>Total Registrations</span>
            <strong>1,284</strong>
            <small>
              <TrendingUp size={13} />
              18% this month
            </small>
          </div>
        </div>

        <div className="admin-report-card">
          <div className="admin-report-icon">
            <MapPin size={21} />
          </div>

          <div>
            <span>Venue Usage</span>
            <strong>68%</strong>
            <small>
              <TrendingUp size={13} />
              8% this month
            </small>
          </div>
        </div>

        <div className="admin-report-card">
          <div className="admin-report-icon">
            <Star size={21} />
          </div>

          <div>
            <span>Average Rating</span>
            <strong>4.3/5</strong>
            <small>
              <Star size={13} />
              From 186 reviews
            </small>
          </div>
        </div>
      </div>

      {/* Event registrations */}

      <div className="admin-report-grid">
        <div className="admin-report-panel">
          <div className="admin-report-panel-header">
            <div>
              <h2>Event Registrations</h2>
              <p>Registrations across recent events.</p>
            </div>

            <BarChart3 size={20} />
          </div>

          <div className="admin-report-bars">
            {eventStats.map((event) => (
              <div className="admin-report-bar-row" key={event.name}>
                <div className="admin-report-bar-label">
                  <span>{event.name}</span>
                  <strong>{event.registrations}</strong>
                </div>

                <div className="admin-report-bar-track">
                  <div
                    className="admin-report-bar-fill"
                    style={{
                      width: `${Math.min(
                        (event.registrations / 150) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Venue usage */}

        <div className="admin-report-panel">
          <div className="admin-report-panel-header">
            <div>
              <h2>Venue Usage</h2>
              <p>Current venue utilization.</p>
            </div>

            <MapPin size={20} />
          </div>

          <div className="admin-venue-report-list">
            {venueStats.map((venue) => (
              <div className="admin-venue-report-row" key={venue.name}>
                <div>
                  <strong>{venue.name}</strong>

                  <div className="admin-venue-progress">
                    <div
                      style={{
                        width: venue.usage,
                      }}
                    />
                  </div>
                </div>

                <span>{venue.usage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback summary */}

      <div className="admin-report-panel admin-feedback-report">
        <div className="admin-report-panel-header">
          <div>
            <h2>Feedback Summary</h2>
            <p>Overall participant satisfaction.</p>
          </div>

          <Star size={20} />
        </div>

        <div className="admin-rating-summary">
          <div className="admin-rating-number">
            <strong>4.3</strong>
            <div className="admin-rating-stars">
              ★★★★★
            </div>
            <span>Average rating</span>
          </div>

          <div className="admin-rating-bars">
            <div>
              <span>5 ★</span>
              <div>
                <i style={{ width: "72%" }} />
              </div>
              <strong>72%</strong>
            </div>

            <div>
              <span>4 ★</span>
              <div>
                <i style={{ width: "18%" }} />
              </div>
              <strong>18%</strong>
            </div>

            <div>
              <span>3 ★</span>
              <div>
                <i style={{ width: "7%" }} />
              </div>
              <strong>7%</strong>
            </div>

            <div>
              <span>2 ★</span>
              <div>
                <i style={{ width: "2%" }} />
              </div>
              <strong>2%</strong>
            </div>

            <div>
              <span>1 ★</span>
              <div>
                <i style={{ width: "1%" }} />
              </div>
              <strong>1%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;